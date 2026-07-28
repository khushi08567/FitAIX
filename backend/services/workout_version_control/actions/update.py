"""
actions/update.py — Edit an existing workout plan.

Updating a plan automatically snapshots the previous state into
WorkoutVersionHistory before applying changes, maintaining a full audit trail.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.models.workout import WorkoutPlan, WorkoutExercise
from backend.services.workout_version_control.schemas import (
    WorkoutPlanUpdate,
    WorkoutPlanRead,
)
from backend.services.workout_version_control import history as history_service


def _snapshot_plan(plan: WorkoutPlan) -> dict:
    """
    Build a JSON-serialisable snapshot of a plan's current state.

    This snapshot is stored as ``previous_snapshot`` in
    :class:`WorkoutVersionHistory` before any changes are applied.

    Args:
        plan: The ORM WorkoutPlan instance (with exercises eagerly loaded).

    Returns:
        A dict capturing plan name, version number, and all exercise details.
    """
    return {
        "name": plan.name,
        "version_number": plan.version_number,
        "exercises": [
            {
                "exercise_id": ex.exercise_id,
                "sets": ex.sets,
                "reps": ex.reps,
                "weight": ex.weight,
                "rest_seconds": ex.rest_seconds,
                "order_index": ex.order_index,
            }
            for ex in plan.exercises
        ],
    }


async def update_workout_plan(
    db: AsyncSession,
    user_id: int,
    plan_id: int,
    payload: WorkoutPlanUpdate,
) -> WorkoutPlanRead:
    """
    Edit an existing workout plan owned by the user.

    Workflow:
        1. Fetch the plan and verify ownership + active status.
        2. Snapshot the current state into WorkoutVersionHistory.
        3. Apply the requested changes (name and/or exercise list).
        4. Increment ``version_number`` on the plan.
        5. Persist and return the updated plan.

    Args:
        db:       Async SQLAlchemy session.
        user_id:  ID of the authenticated user (ownership check).
        plan_id:  Primary key of the plan to update.
        payload:  Partial update payload; omitted fields are left unchanged.

    Returns:
        Updated :class:`WorkoutPlanRead` schema.

    Raises:
        HTTPException 404: Plan not found or not owned by user.
        HTTPException 410: Plan has been soft-deleted.
    """
    result = await db.execute(
        select(WorkoutPlan)
        .options(selectinload(WorkoutPlan.exercises))
        .where(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id)
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout plan {plan_id} not found or does not belong to you.",
        )
    if not plan.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Workout plan {plan_id} has been deleted and cannot be modified.",
        )

    # --- 1. Snapshot before mutation ---
    snapshot = _snapshot_plan(plan)

    # --- 2. Apply changes ---
    changed_fields = []

    if payload.name is not None and payload.name != plan.name:
        changed_fields.append(f"name changed from '{plan.name}' to '{payload.name}'")
        plan.name = payload.name

    if payload.exercises is not None:
        # Replace exercise list — delete old rows, insert new
        for ex in plan.exercises:
            await db.delete(ex)
        await db.flush()

        new_exercises = [
            WorkoutExercise(
                workout_plan_id=plan.id,
                exercise_id=ex.exercise_id,
                sets=ex.sets,
                reps=ex.reps,
                weight=ex.weight,
                rest_seconds=ex.rest_seconds,
                order_index=ex.order_index,
            )
            for ex in payload.exercises
        ]
        db.add_all(new_exercises)
        changed_fields.append(f"exercise list updated ({len(new_exercises)} exercises)")

    if not changed_fields:
        # Nothing actually changed — return current state without bumping version
        return WorkoutPlanRead.model_validate(plan)

    # --- 3. Increment version ---
    plan.version_number += 1
    await db.flush()

    # --- 4. Record history entry ---
    change_summary = "Manual edit: " + "; ".join(changed_fields)
    await history_service.record_version(
        db=db,
        plan_id=plan.id,
        new_version=plan.version_number,
        change_summary=change_summary,
        previous_snapshot=snapshot,
        change_type="manual_edit",
    )

    await db.commit()
    await db.refresh(plan)
    return WorkoutPlanRead.model_validate(plan)

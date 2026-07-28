"""
actions/rollback.py — Revert a workout plan to a previous version.

Restores the plan's exercise list from a stored snapshot and logs the
rollback as a new version history entry, maintaining a complete audit trail.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.models.workout import WorkoutPlan, WorkoutExercise, WorkoutVersionHistory
from backend.services.workout_version_control.schemas import (
    RollbackRequest,
    WorkoutPlanRead,
)
from backend.services.workout_version_control import history as history_service
from backend.services.workout_version_control.actions.update import _snapshot_plan


async def rollback_workout_plan(
    db: AsyncSession,
    user_id: int,
    plan_id: int,
    payload: RollbackRequest,
) -> WorkoutPlanRead:
    """
    Revert a workout plan to the state captured in a previous version snapshot.

    Workflow:
        1. Verify ownership and that the plan is active.
        2. Load the snapshot for the requested ``target_version``.
        3. Snapshot the *current* state (for the new history entry).
        4. Delete current :class:`WorkoutExercise` rows and rebuild from snapshot.
        5. Increment ``version_number`` and restore ``name`` from snapshot.
        6. Record a rollback entry in :mod:`history` (type = ``"rollback"``).

    Args:
        db:       Async SQLAlchemy session.
        user_id:  ID of the authenticated user (ownership check).
        plan_id:  ID of the WorkoutPlan to roll back.
        payload:  Contains the ``target_version`` to restore.

    Returns:
        The restored :class:`WorkoutPlanRead` schema.

    Raises:
        HTTPException 404: Plan or target version not found / not owned.
        HTTPException 410: Plan has been soft-deleted.
        HTTPException 400: Attempting to roll back to the current version.
    """
    # --- 1. Fetch plan ---
    plan_result = await db.execute(
        select(WorkoutPlan)
        .options(selectinload(WorkoutPlan.exercises))
        .where(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id)
    )
    plan = plan_result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout plan {plan_id} not found or does not belong to you.",
        )
    if not plan.is_active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Workout plan {plan_id} is deleted and cannot be rolled back.",
        )
    if payload.target_version == plan.version_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plan is already at version {payload.target_version}.",
        )

    # --- 2. Load target snapshot ---
    snap_result = await db.execute(
        select(WorkoutVersionHistory).where(
            WorkoutVersionHistory.workout_plan_id == plan_id,
            WorkoutVersionHistory.version_number == payload.target_version,
        )
    )
    history_entry = snap_result.scalar_one_or_none()

    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Version {payload.target_version} not found for plan {plan_id}. "
                "Cannot roll back to a non-existent snapshot."
            ),
        )

    target_snapshot = history_entry.previous_snapshot

    # --- 3. Snapshot current state before overwriting ---
    current_snapshot = _snapshot_plan(plan)

    # --- 4. Replace exercise rows ---
    for ex in plan.exercises:
        await db.delete(ex)
    await db.flush()

    restored_exercises = [
        WorkoutExercise(
            workout_plan_id=plan.id,
            exercise_id=ex_data["exercise_id"],
            sets=ex_data.get("sets", 3),
            reps=ex_data.get("reps", 10),
            weight=ex_data.get("weight", 0.0),
            rest_seconds=ex_data.get("rest_seconds", 60),
            order_index=ex_data.get("order_index", 0),
        )
        for ex_data in target_snapshot.get("exercises", [])
    ]
    db.add_all(restored_exercises)

    # --- 5. Update plan metadata ---
    if "name" in target_snapshot:
        plan.name = target_snapshot["name"]
    plan.version_number += 1
    await db.flush()

    # --- 6. Record rollback in history ---
    await history_service.record_version(
        db=db,
        plan_id=plan.id,
        new_version=plan.version_number,
        change_summary=(
            f"Rolled back to version {payload.target_version} "
            f"(previous version was {current_snapshot['version_number']})."
        ),
        previous_snapshot=current_snapshot,
        change_type="rollback",
    )

    await db.commit()
    await db.refresh(plan)
    return WorkoutPlanRead.model_validate(plan)

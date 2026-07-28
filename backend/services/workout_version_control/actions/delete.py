"""
actions/delete.py — Soft-delete a workout plan.

Hard deletion is explicitly prohibited to preserve version history integrity.
Deleting a plan sets ``is_active = False``; all history, logs, and snapshots
remain in the database.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.models.workout import WorkoutPlan
from backend.services.workout_version_control.schemas import MessageResponse
from backend.services.workout_version_control import history as history_service
from backend.services.workout_version_control.actions.update import _snapshot_plan


async def soft_delete_workout_plan(
    db: AsyncSession,
    user_id: int,
    plan_id: int,
) -> MessageResponse:
    """
    Soft-delete a workout plan by marking it as inactive.

    The plan record, its exercise rows, logs, and full version history are
    **never removed** from the database.  Setting ``is_active = False`` is
    the only mutation applied.

    A new version history entry is recorded to document the deletion event,
    preserving the audit trail.

    Args:
        db:       Async SQLAlchemy session.
        user_id:  ID of the authenticated user (ownership check).
        plan_id:  Primary key of the plan to soft-delete.

    Returns:
        A :class:`MessageResponse` confirming the deletion.

    Raises:
        HTTPException 404: Plan not found or not owned by the user.
        HTTPException 409: Plan is already soft-deleted.
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
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Workout plan {plan_id} is already deleted.",
        )

    # Snapshot before marking deleted
    snapshot = _snapshot_plan(plan)

    # Soft delete
    plan.is_active = False
    plan.version_number += 1
    await db.flush()

    # Record deletion in version history
    await history_service.record_version(
        db=db,
        plan_id=plan.id,
        new_version=plan.version_number,
        change_summary="Plan soft-deleted by user.",
        previous_snapshot=snapshot,
        change_type="deletion",
    )

    await db.commit()
    return MessageResponse(message=f"Workout plan '{plan.name}' has been deleted.")

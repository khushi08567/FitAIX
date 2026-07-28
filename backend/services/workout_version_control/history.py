"""
history.py — Workout plan version history management.

Provides:
    - record_version:     Persist a new WorkoutVersionHistory entry.
    - get_version_history: Fetch the full audit trail for a plan.
"""

from __future__ import annotations

from typing import Any, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.workout import WorkoutVersionHistory, WorkoutPlan
from backend.services.workout_version_control.schemas import VersionHistoryRead
from backend.services.workout_version_control import explanation_link


async def record_version(
    db: AsyncSession,
    plan_id: int,
    new_version: int,
    change_summary: str,
    previous_snapshot: dict[str, Any],
    change_type: str = "manual_edit",
) -> WorkoutVersionHistory:
    """
    Persist a new version history entry for a workout plan.

    This function is called by ``create``, ``update``, ``delete``, and
    ``rollback`` actions every time the plan state changes.

    Args:
        db:                Async SQLAlchemy session.
        plan_id:           ID of the WorkoutPlan being versioned.
        new_version:       The version number *after* the change is applied.
        change_summary:    Short description of what changed.
        previous_snapshot: JSON-serialisable dict capturing the plan state
                           *before* this change was applied.
        change_type:       Internal category code used by ``explanation_link``
                           to generate a human-readable explanation.

    Returns:
        The newly created :class:`WorkoutVersionHistory` ORM instance
        (not yet committed — caller is responsible for the transaction).
    """
    entry = WorkoutVersionHistory(
        workout_plan_id=plan_id,
        version_number=new_version,
        change_summary=change_summary,
        previous_snapshot=previous_snapshot,
    )
    # Embed the change_type inside the snapshot metadata for later retrieval
    entry.previous_snapshot["_change_type"] = change_type

    db.add(entry)
    await db.flush()
    return entry


async def get_version_history(
    db: AsyncSession,
    user_id: int,
    plan_id: int,
) -> List[VersionHistoryRead]:
    """
    Retrieve the full version history for a workout plan, ordered by version number.

    Ownership of the plan is verified against ``user_id`` before fetching.
    Each history entry is enriched with a human-readable explanation via
    :mod:`explanation_link`.

    Args:
        db:       Async SQLAlchemy session.
        user_id:  ID of the authenticated user (ownership check).
        plan_id:  ID of the WorkoutPlan whose history to retrieve.

    Returns:
        List of :class:`VersionHistoryRead` schemas, oldest version first.

    Raises:
        HTTPException 404: Plan not found or not owned by the user.
    """
    # Verify ownership
    plan_result = await db.execute(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id
        )
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout plan {plan_id} not found or does not belong to you.",
        )

    history_result = await db.execute(
        select(WorkoutVersionHistory)
        .where(WorkoutVersionHistory.workout_plan_id == plan_id)
        .order_by(WorkoutVersionHistory.version_number.asc())
    )
    entries: list[WorkoutVersionHistory] = list(history_result.scalars().all())

    output: list[VersionHistoryRead] = []
    for entry in entries:
        change_type = entry.previous_snapshot.get("_change_type", "unknown")
        human_explanation = explanation_link.get_explanation(
            change_type=change_type,
            change_summary=entry.change_summary,
        )

        # Build response — strip internal metadata key from the exposed snapshot
        snapshot_clean = {
            k: v for k, v in entry.previous_snapshot.items() if k != "_change_type"
        }

        output.append(
            VersionHistoryRead(
                id=entry.id,
                workout_plan_id=entry.workout_plan_id,
                version_number=entry.version_number,
                change_summary=entry.change_summary,
                changed_at=entry.changed_at,
                previous_snapshot=snapshot_clean,
                explanation=human_explanation,
            )
        )

    return output

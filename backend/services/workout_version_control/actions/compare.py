"""
actions/compare.py — Diff two versions of a workout plan.

Given two version numbers for the same plan, returns a structured diff
showing which exercises were added, removed, or had their prescription
(sets/reps/weight/rest) changed.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.workout import WorkoutVersionHistory, WorkoutPlan
from backend.services.workout_version_control.schemas import (
    CompareResponse,
    ExerciseDiff,
)


def _exercise_map(snapshot: dict) -> dict[int, dict]:
    """
    Index exercises in a plan snapshot by ``exercise_id``.

    Args:
        snapshot: A plan snapshot dict (as stored in ``previous_snapshot``).

    Returns:
        Mapping of ``exercise_id`` → exercise prescription dict.
    """
    return {
        ex["exercise_id"]: ex
        for ex in snapshot.get("exercises", [])
    }


async def compare_versions(
    db: AsyncSession,
    user_id: int,
    plan_id: int,
    version_a: int,
    version_b: int,
) -> CompareResponse:
    """
    Compute a diff between two versions of a workout plan.

    Each version's snapshot is retrieved from :class:`WorkoutVersionHistory`.
    Version A must be older than version B (or equal).  The diff computes:

    - **Added exercises**: present in version B, absent in version A.
    - **Removed exercises**: present in version A, absent in version B.
    - **Modified exercises**: present in both but with different prescription.

    Args:
        db:        Async SQLAlchemy session.
        user_id:   ID of the authenticated user (ownership check).
        plan_id:   ID of the WorkoutPlan to compare versions for.
        version_a: Older (or equal) version number.
        version_b: Newer (or equal) version number.

    Returns:
        A :class:`CompareResponse` with three categorised exercise diff lists.

    Raises:
        HTTPException 400: version_a > version_b.
        HTTPException 404: Plan not found / not owned, or requested version not found.
    """
    # Ownership check
    plan_result = await db.execute(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id
        )
    )
    if not plan_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout plan {plan_id} not found or does not belong to you.",
        )

    if version_a > version_b:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="version_a must be less than or equal to version_b.",
        )

    # Fetch both history entries
    history_result = await db.execute(
        select(WorkoutVersionHistory)
        .where(
            WorkoutVersionHistory.workout_plan_id == plan_id,
            WorkoutVersionHistory.version_number.in_([version_a, version_b]),
        )
    )
    entries: dict[int, WorkoutVersionHistory] = {
        row.version_number: row for row in history_result.scalars().all()
    }

    if version_a not in entries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Version {version_a} not found for plan {plan_id}.",
        )
    if version_b not in entries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Version {version_b} not found for plan {plan_id}.",
        )

    map_a = _exercise_map(entries[version_a].previous_snapshot)
    map_b = _exercise_map(entries[version_b].previous_snapshot)

    ids_a = set(map_a.keys())
    ids_b = set(map_b.keys())

    added: list[ExerciseDiff] = [
        ExerciseDiff(
            exercise_id=eid,
            change_type="added",
            before=None,
            after=map_b[eid],
        )
        for eid in (ids_b - ids_a)
    ]

    removed: list[ExerciseDiff] = [
        ExerciseDiff(
            exercise_id=eid,
            change_type="removed",
            before=map_a[eid],
            after=None,
        )
        for eid in (ids_a - ids_b)
    ]

    modified: list[ExerciseDiff] = []
    for eid in ids_a & ids_b:
        before = map_a[eid]
        after = map_b[eid]
        # Compare prescription fields only (ignore internal keys)
        prescription_keys = {"sets", "reps", "weight", "rest_seconds", "order_index"}
        if any(before.get(k) != after.get(k) for k in prescription_keys):
            modified.append(
                ExerciseDiff(
                    exercise_id=eid,
                    change_type="modified",
                    before=before,
                    after=after,
                )
            )

    return CompareResponse(
        workout_plan_id=plan_id,
        version_a=version_a,
        version_b=version_b,
        exercises_added=added,
        exercises_removed=removed,
        exercises_modified=modified,
    )

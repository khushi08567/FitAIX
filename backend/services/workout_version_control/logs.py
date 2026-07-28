"""
logs.py — Past completed workout logs (actual performance records).

Provides:
    - log_completed_workout:  Persist a session's actual performance data.
    - get_workout_logs:       Retrieve past logs with optional date/exercise filters.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

from backend.models.workout import WorkoutLog, WorkoutExercise, Exercise
from backend.services.workout_version_control.schemas import (
    WorkoutLogCreate,
    WorkoutLogRead,
)


async def log_completed_workout(
    db: AsyncSession,
    user_id: int,
    payload: WorkoutLogCreate,
) -> WorkoutLogRead:
    """
    Record a completed workout session for the authenticated user.

    Each log entry captures the exercises actually performed — sets, reps,
    and weight — alongside the planned values for easy comparison.  The
    ``date_completed`` field defaults to the current UTC time if not supplied.

    Args:
        db:       Async SQLAlchemy session.
        user_id:  ID of the authenticated user.
        payload:  Validated log creation request.

    Returns:
        The newly created :class:`WorkoutLogRead` schema.

    Raises:
        HTTPException 400: exercises_performed list is empty.
    """
    if not payload.exercises_performed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="exercises_performed must contain at least one entry.",
        )

    completed_at = payload.date_completed or datetime.utcnow()

    # Serialise exercise entries to plain dicts for JSON storage
    exercises_json = [entry.model_dump() for entry in payload.exercises_performed]

    log = WorkoutLog(
        user_id=user_id,
        workout_plan_id=payload.workout_plan_id,
        date_completed=completed_at,
        exercises_performed=exercises_json,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    return WorkoutLogRead.model_validate(log)


async def get_workout_logs(
    db: AsyncSession,
    user_id: int,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    muscle_group: Optional[str] = None,
    exercise_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[WorkoutLogRead]:
    """
    Fetch past workout logs for the authenticated user with optional filters.

    Date range filtering applies to ``date_completed``.  Muscle group and
    exercise filters work by inspecting the ``exercises_performed`` JSON for
    matching ``exercise_id`` values, looking up the :class:`Exercise` table
    for muscle group resolution.

    Args:
        db:           Async SQLAlchemy session.
        user_id:      ID of the authenticated user.
        date_from:    Include logs on or after this UTC datetime.
        date_to:      Include logs on or before this UTC datetime.
        muscle_group: Filter to logs containing at least one exercise targeting
                      this muscle group (case-insensitive).
        exercise_id:  Filter to logs containing a specific exercise ID.
        limit:        Maximum number of results (default 50).
        offset:       Pagination offset (default 0).

    Returns:
        List of :class:`WorkoutLogRead` schemas, ordered newest-first.
    """
    conditions = [WorkoutLog.user_id == user_id]

    if date_from:
        conditions.append(WorkoutLog.date_completed >= date_from)
    if date_to:
        conditions.append(WorkoutLog.date_completed <= date_to)

    query = (
        select(WorkoutLog)
        .where(and_(*conditions))
        .order_by(WorkoutLog.date_completed.desc())
        .limit(limit)
        .offset(offset)
    )

    result = await db.execute(query)
    logs: list[WorkoutLog] = list(result.scalars().all())

    # ------------------------------------------------------------------ #
    # Post-fetch filter: muscle group / exercise_id                        #
    # These filters examine the stored JSON payload; doing them in Python  #
    # is simpler than writing complex JSON-path SQL and keeps DB portability. #
    # ------------------------------------------------------------------ #

    if exercise_id is not None:
        logs = [
            log for log in logs
            if any(
                entry.get("exercise_id") == exercise_id
                for entry in log.exercises_performed
            )
        ]

    if muscle_group is not None:
        # Collect exercise IDs that match the requested muscle group
        mg_result = await db.execute(
            select(Exercise.id).where(
                Exercise.muscle_group.ilike(f"%{muscle_group}%")
            )
        )
        matching_ids: set[int] = {row[0] for row in mg_result.fetchall()}

        logs = [
            log for log in logs
            if any(
                entry.get("exercise_id") in matching_ids
                for entry in log.exercises_performed
            )
        ]

    return [WorkoutLogRead.model_validate(log) for log in logs]

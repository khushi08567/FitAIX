"""
progress.py — Progress chart data aggregation.

Aggregates WorkoutLog data into time-series datasets ready for frontend
charting.  All aggregations return arrays of {date, value} objects.

Metrics available:
    - ``total_weight``  — sum of (weight × reps × sets) across all exercises per period.
    - ``total_volume``  — alias for total_weight (sets × reps × weight).
    - ``frequency``     — number of distinct workout sessions per period.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Literal, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.workout import WorkoutLog
from backend.services.workout_version_control.schemas import (
    ChartDataPoint,
    ProgressResponse,
)

# Type alias for granularity
Granularity = Literal["weekly", "monthly"]


def _period_key(dt: datetime, granularity: Granularity) -> str:
    """
    Convert a datetime to a bucket key string for the given granularity.

    Weekly buckets use ISO week start (Monday), formatted as ``YYYY-MM-DD``.
    Monthly buckets use the first day of the month, formatted as ``YYYY-MM-DD``.

    Args:
        dt:          The datetime to bucket.
        granularity: ``"weekly"`` or ``"monthly"``.

    Returns:
        ISO-8601 date string representing the start of the period.
    """
    if granularity == "weekly":
        # Monday of the ISO week
        monday = dt - timedelta(days=dt.weekday())
        return monday.strftime("%Y-%m-%d")
    else:  # monthly
        return dt.strftime("%Y-%m-01")


def _compute_session_volume(exercises_performed: list[dict]) -> float:
    """
    Compute total volume (sets × reps × weight) for a single session.

    Each entry in ``exercises_performed`` should contain an ``actual`` dict
    with ``sets``, ``reps``, and ``weight`` keys.

    Args:
        exercises_performed: List of exercise performance dicts from WorkoutLog.

    Returns:
        Total volume as a float.
    """
    total = 0.0
    for entry in exercises_performed:
        actual = entry.get("actual", {})
        sets = actual.get("sets", 0)
        reps = actual.get("reps", 0)
        weight = actual.get("weight", 0.0)
        total += sets * reps * weight
    return total


async def get_progress_data(
    db: AsyncSession,
    user_id: int,
    metric: Literal["total_weight", "total_volume", "frequency"],
    granularity: Granularity = "weekly",
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> ProgressResponse:
    """
    Aggregate workout log data into a time-series for frontend charting.

    Available metrics
    -----------------
    - ``total_weight`` / ``total_volume`` — sum of (sets × reps × weight) per
      exercise per session, aggregated by period.  Both names return the same
      metric (volume = total weight lifted).
    - ``frequency`` — number of distinct workout sessions per period.

    Args:
        db:          Async SQLAlchemy session.
        user_id:     ID of the authenticated user.
        metric:      Which metric to compute.
        granularity: Time bucket size — ``"weekly"`` or ``"monthly"``.
        date_from:   Only include logs on or after this UTC datetime.
        date_to:     Only include logs on or before this UTC datetime.

    Returns:
        A :class:`ProgressResponse` with sorted ``data`` list ready for
        a line / bar chart on the frontend.

    Raises:
        HTTPException 400: Unknown metric requested.
    """
    valid_metrics = {"total_weight", "total_volume", "frequency"}
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown metric '{metric}'. Choose from: {sorted(valid_metrics)}.",
        )

    # Build query
    conditions = [WorkoutLog.user_id == user_id]
    if date_from:
        conditions.append(WorkoutLog.date_completed >= date_from)
    if date_to:
        conditions.append(WorkoutLog.date_completed <= date_to)

    result = await db.execute(
        select(WorkoutLog)
        .where(*conditions)
        .order_by(WorkoutLog.date_completed.asc())
    )
    logs: list[WorkoutLog] = list(result.scalars().all())

    # Aggregate into period buckets
    buckets: dict[str, float] = defaultdict(float)

    for log in logs:
        period = _period_key(log.date_completed, granularity)

        if metric in ("total_weight", "total_volume"):
            buckets[period] += _compute_session_volume(log.exercises_performed)
        elif metric == "frequency":
            buckets[period] += 1.0

    # Build sorted output
    data_points: List[ChartDataPoint] = [
        ChartDataPoint(date=period, value=round(value, 2))
        for period, value in sorted(buckets.items())
    ]

    return ProgressResponse(
        metric=metric,
        granularity=granularity,
        data=data_points,
    )

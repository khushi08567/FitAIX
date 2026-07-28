"""
routes/workout_version_control.py — FastAPI router for the Workout Version Control feature.

All endpoints are prefixed with ``/api/workout-version-control`` and require
JWT authentication.  Business logic is delegated entirely to the service
modules in ``backend/services/02_workout_version_control/``.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.services.authentication.jwt import get_current_user

# ── Service imports ──────────────────────────────────────────────────────────
from backend.services.workout_version_control.actions.create import (
    create_workout_plan,
    create_workout_plan_with_ai,
)
from backend.services.workout_version_control.actions.update import (
    update_workout_plan,
)
from backend.services.workout_version_control.actions.delete import (
    soft_delete_workout_plan,
)
from backend.services.workout_version_control.actions.compare import (
    compare_versions,
)
from backend.services.workout_version_control.actions.rollback import (
    rollback_workout_plan,
)
from backend.services.workout_version_control.history import get_version_history
from backend.services.workout_version_control.logs import (
    log_completed_workout,
    get_workout_logs,
)
from backend.services.workout_version_control.progress import get_progress_data

# ── Schema imports ────────────────────────────────────────────────────────────
from backend.services.workout_version_control.schemas import (
    AIWorkoutPlanRequest,
    WorkoutPlanCreate,
    WorkoutPlanRead,
    WorkoutPlanUpdate,
    RollbackRequest,
    CompareResponse,
    VersionHistoryRead,
    WorkoutLogCreate,
    WorkoutLogRead,
    ProgressResponse,
    MessageResponse,
)

router = APIRouter(
    prefix="/api/workout-version-control",
    tags=["Workout Version Control"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Plan CRUD
# ─────────────────────────────────────────────────────────────────────────────


@router.post(
    "/plans",
    response_model=WorkoutPlanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new workout plan",
)
async def create_plan(
    payload: WorkoutPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> WorkoutPlanRead:
    """
    Manually create a new workout plan for the authenticated user.

    The user specifies the plan name and an ordered list of exercises with
    their prescribed sets, reps, weight, and rest time.  An AI-assisted
    creation endpoint will be added once ``01_adaptive_planning_engine`` is
    ready.

    Returns the newly created plan with its assigned ID and version 1.
    """
    try:
        return await create_workout_plan(db=db, user_id=current_user.id, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post(
    "/plans/ai-stub",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="AI-assisted workout plan creation placeholder",
)
async def create_ai_plan(
    payload: AIWorkoutPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> None:
    """Expose the archive's AI-plan placeholder without adding a second backend."""
    try:
        await create_workout_plan_with_ai(
            db=db,
            user_id=current_user.id,
            user_goals={"prompt": payload.prompt},
        )
    except NotImplementedError as exc:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(exc),
        )


@router.patch(
    "/plans/{plan_id}",
    response_model=WorkoutPlanRead,
    summary="Update an existing workout plan",
)
async def update_plan(
    plan_id: int,
    payload: WorkoutPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> WorkoutPlanRead:
    """
    Edit the name or exercise list of an existing workout plan.

    Any change automatically creates a new :class:`WorkoutVersionHistory`
    entry, preserving the previous state as a snapshot.  Omit fields that
    should remain unchanged.

    Returns the updated plan with an incremented version number.
    """
    return await update_workout_plan(
        db=db, user_id=current_user.id, plan_id=plan_id, payload=payload
    )


@router.delete(
    "/plans/{plan_id}",
    response_model=MessageResponse,
    summary="Soft-delete a workout plan",
)
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> MessageResponse:
    """
    Soft-delete a workout plan by marking it inactive.

    The plan and all its associated version history, exercises, and logs are
    **never removed** from the database — this is intentional to preserve the
    full audit trail.  A deleted plan cannot be updated or rolled back.
    """
    return await soft_delete_workout_plan(
        db=db, user_id=current_user.id, plan_id=plan_id
    )


# ─────────────────────────────────────────────────────────────────────────────
# Version History
# ─────────────────────────────────────────────────────────────────────────────


@router.get(
    "/plans/{plan_id}/history",
    response_model=List[VersionHistoryRead],
    summary="Get full version history for a plan",
)
async def plan_history(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[VersionHistoryRead]:
    """
    Retrieve the complete ordered version history for a workout plan.

    Each entry includes the snapshot taken before the change was applied,
    the change summary, timestamp, and a human-readable explanation of why
    the plan changed (e.g. manual edit, rollback, future AI suggestion).
    """
    return await get_version_history(db=db, user_id=current_user.id, plan_id=plan_id)


# ─────────────────────────────────────────────────────────────────────────────
# Compare
# ─────────────────────────────────────────────────────────────────────────────


@router.get(
    "/plans/{plan_id}/compare",
    response_model=CompareResponse,
    summary="Diff two versions of a workout plan",
)
async def compare_plan_versions(
    plan_id: int,
    version_a: int = Query(..., ge=1, description="Older version number"),
    version_b: int = Query(..., ge=1, description="Newer version number"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> CompareResponse:
    """
    Compare two versions of the same workout plan and return a structured diff.

    The response categorises changes into:
    - **exercises_added** — in version B but not version A.
    - **exercises_removed** — in version A but not version B.
    - **exercises_modified** — present in both but with different prescription.

    ``version_a`` must be ≤ ``version_b``.
    """
    return await compare_versions(
        db=db,
        user_id=current_user.id,
        plan_id=plan_id,
        version_a=version_a,
        version_b=version_b,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Rollback
# ─────────────────────────────────────────────────────────────────────────────


@router.post(
    "/plans/{plan_id}/rollback",
    response_model=WorkoutPlanRead,
    summary="Roll back a plan to a previous version",
)
async def rollback_plan(
    plan_id: int,
    payload: RollbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> WorkoutPlanRead:
    """
    Revert a workout plan to a previously stored version snapshot.

    The rollback is itself recorded as a new version entry in
    :class:`WorkoutVersionHistory`, so the audit trail is never broken.
    The ``target_version`` must exist in the plan's history.

    Returns the restored plan with a new incremented version number.
    """
    return await rollback_workout_plan(
        db=db, user_id=current_user.id, plan_id=plan_id, payload=payload
    )


# ─────────────────────────────────────────────────────────────────────────────
# Workout Logs (Past Session History)
# ─────────────────────────────────────────────────────────────────────────────


@router.post(
    "/logs",
    response_model=WorkoutLogRead,
    status_code=status.HTTP_201_CREATED,
    summary="Log a completed workout session",
)
async def create_log(
    payload: WorkoutLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> WorkoutLogRead:
    """
    Record a completed workout session for the authenticated user.

    Each entry stores the exercises actually performed — sets, reps, and
    weight — alongside the planned values for side-by-side comparison.
    ``workout_plan_id`` is optional for free-form sessions.
    """
    try:
        return await log_completed_workout(
            db=db, user_id=current_user.id, payload=payload
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/logs",
    response_model=List[WorkoutLogRead],
    summary="Fetch past workout logs with optional filters",
)
async def fetch_logs(
    date_from: Optional[datetime] = Query(None, description="Filter logs from this UTC datetime"),
    date_to: Optional[datetime] = Query(None, description="Filter logs up to this UTC datetime"),
    muscle_group: Optional[str] = Query(None, description="Filter by muscle group (partial match)"),
    exercise_id: Optional[int] = Query(None, description="Filter by specific exercise ID"),
    limit: int = Query(50, ge=1, le=200, description="Max results to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[WorkoutLogRead]:
    """
    Retrieve past workout session logs for the authenticated user.

    Supports filtering by:
    - **date range** (``date_from`` / ``date_to``)
    - **muscle group** — returns sessions that included at least one exercise
      targeting the given muscle group.
    - **exercise_id** — returns sessions that included the specific exercise.

    Results are returned newest-first with pagination support.
    """
    return await get_workout_logs(
        db=db,
        user_id=current_user.id,
        date_from=date_from,
        date_to=date_to,
        muscle_group=muscle_group,
        exercise_id=exercise_id,
        limit=limit,
        offset=offset,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Progress Charts
# ─────────────────────────────────────────────────────────────────────────────


@router.get(
    "/progress",
    response_model=ProgressResponse,
    summary="Get progress chart data",
)
async def progress_chart(
    metric: Literal["total_weight", "total_volume", "frequency"] = Query(
        "total_volume",
        description=(
            "Metric to aggregate: "
            "'total_weight' or 'total_volume' (sets×reps×weight), "
            "'frequency' (sessions per period)"
        ),
    ),
    granularity: Literal["weekly", "monthly"] = Query(
        "weekly", description="Time bucket size"
    ),
    date_from: Optional[datetime] = Query(None, description="Start of the date range"),
    date_to: Optional[datetime] = Query(None, description="End of the date range"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ProgressResponse:
    """
    Return aggregated workout progress data for frontend charting.

    Each data point is a ``{date, value}`` object where ``date`` is the ISO
    start date of the bucket (Monday for weekly, 1st of month for monthly).

    **Metrics:**
    - ``total_volume`` / ``total_weight`` — cumulative (sets × reps × weight)
      across all exercises per session, summed per period.
    - ``frequency`` — number of distinct workout sessions per period.
    """
    return await get_progress_data(
        db=db,
        user_id=current_user.id,
        metric=metric,
        granularity=granularity,
        date_from=date_from,
        date_to=date_to,
    )

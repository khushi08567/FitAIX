"""
actions/create.py — Workout plan creation logic.

Provides:
    - create_workout_plan: manually build a plan from user-supplied exercises.
    - create_workout_plan_with_ai: stub for future AI-assisted creation.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.workout import WorkoutPlan, WorkoutExercise
from backend.services.workout_version_control.schemas import (
    WorkoutPlanCreate,
    WorkoutPlanRead,
)


async def create_workout_plan(
    db: AsyncSession,
    user_id: int,
    payload: WorkoutPlanCreate,
) -> WorkoutPlanRead:
    """
    Manually create a new workout plan for the authenticated user.

    Persists a :class:`WorkoutPlan` record along with its ordered
    :class:`WorkoutExercise` rows.  The initial version number is always 1
    and the plan is active by default.

    Args:
        db:       Async SQLAlchemy session (injected via ``get_db``).
        user_id:  ID of the currently authenticated user.
        payload:  Validated create request containing the plan name and
                  a list of prescribed exercises.

    Returns:
        A :class:`WorkoutPlanRead` schema populated with the newly created plan.

    Raises:
        ValueError: If the exercise list is empty (schema-level guard; belt-and-braces).
    """
    if not payload.exercises:
        raise ValueError("A workout plan must contain at least one exercise.")

    # Build the WorkoutPlan ORM object
    new_plan = WorkoutPlan(
        user_id=user_id,
        name=payload.name,
        is_active=True,
        version_number=1,
    )
    db.add(new_plan)
    await db.flush()  # Obtain new_plan.id before inserting children

    # Build WorkoutExercise rows
    exercise_rows = [
        WorkoutExercise(
            workout_plan_id=new_plan.id,
            exercise_id=ex.exercise_id,
            sets=ex.sets,
            reps=ex.reps,
            weight=ex.weight,
            rest_seconds=ex.rest_seconds,
            order_index=ex.order_index,
        )
        for ex in payload.exercises
    ]
    db.add_all(exercise_rows)
    await db.commit()
    await db.refresh(new_plan)

    return WorkoutPlanRead.model_validate(new_plan)


async def create_workout_plan_with_ai(
    db: AsyncSession,
    user_id: int,
    user_goals: dict,
) -> None:
    """
    Stub: AI-assisted workout plan creation.

    .. note::
        **TODO**: This function depends on the ``01_adaptive_planning_engine``
        service which is not yet implemented.  When that service is ready,
        replace this stub with a call to its planning API, passing
        ``user_goals`` and receiving a structured exercise prescription to
        persist via :func:`create_workout_plan`.

    Args:
        db:         Async SQLAlchemy session.
        user_id:    ID of the authenticated user.
        user_goals: Dict describing user fitness goals, experience level,
                    available equipment, etc.
    """
    # TODO: Integrate with 01_adaptive_planning_engine to generate a
    #       personalised workout plan based on user_goals.
    raise NotImplementedError(
        "AI-assisted workout creation is not yet available. "
        "This depends on 01_adaptive_planning_engine."
    )

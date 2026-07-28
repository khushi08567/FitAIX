"""
Pydantic request/response schemas for the Workout Version Control feature.

All schemas used by route handlers and service functions are defined here to
keep validation and serialisation logic in one place.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Exercise schemas
# ---------------------------------------------------------------------------


class ExerciseBase(BaseModel):
    """Shared fields for Exercise create / read."""

    name: str = Field(..., min_length=1, max_length=255, description="Exercise name")
    muscle_group: str = Field(..., max_length=100, description="Primary muscle group targeted")
    equipment_needed: Optional[str] = Field("None", max_length=100, description="Equipment required")


class ExerciseCreate(ExerciseBase):
    """Request body for creating a new exercise in the library."""
    pass


class ExerciseRead(ExerciseBase):
    """Response model for a single exercise."""

    id: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# WorkoutExercise (plan prescription) schemas
# ---------------------------------------------------------------------------


class WorkoutExerciseBase(BaseModel):
    """Shared fields for a prescribed exercise within a plan."""

    exercise_id: int = Field(..., description="ID of the exercise from the library")
    sets: int = Field(3, ge=1, description="Number of sets")
    reps: int = Field(10, ge=1, description="Reps per set")
    weight: float = Field(0.0, ge=0.0, description="Load in kg (0 = bodyweight)")
    rest_seconds: int = Field(60, ge=0, description="Rest between sets in seconds")
    order_index: int = Field(0, ge=0, description="Order position within the plan")


class WorkoutExerciseCreate(WorkoutExerciseBase):
    """Request body for adding an exercise to a plan."""
    pass


class WorkoutExerciseRead(WorkoutExerciseBase):
    """Response model for a prescribed exercise."""

    id: int
    exercise: Optional[ExerciseRead] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# WorkoutPlan schemas
# ---------------------------------------------------------------------------


class WorkoutPlanCreate(BaseModel):
    """Request body for creating a new workout plan manually."""

    name: str = Field(..., min_length=1, max_length=255, description="Plan name")
    exercises: List[WorkoutExerciseCreate] = Field(
        ..., min_length=1, description="Ordered list of exercises in the plan"
    )


class AIWorkoutPlanRequest(BaseModel):
    """Prompt accepted by the AI-assisted plan creation placeholder."""

    prompt: str = Field(..., min_length=1, description="Workout request prompt")


class WorkoutPlanRead(BaseModel):
    """Response model for a workout plan."""

    id: int
    user_id: int
    name: str
    created_at: datetime
    is_active: bool
    version_number: int
    exercises: List[WorkoutExerciseRead] = []

    model_config = {"from_attributes": True}


class WorkoutPlanSummary(BaseModel):
    """Lightweight plan summary (used in list responses)."""

    id: int
    name: str
    is_active: bool
    version_number: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Update schemas
# ---------------------------------------------------------------------------


class WorkoutPlanUpdate(BaseModel):
    """
    Request body for updating an existing workout plan.

    Partial updates are supported — omit any field to leave it unchanged.
    Supplying ``exercises`` replaces the full exercise list for the plan.
    """

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    exercises: Optional[List[WorkoutExerciseCreate]] = Field(
        None, description="Full replacement exercise list (replaces existing)"
    )


# ---------------------------------------------------------------------------
# Version history schemas
# ---------------------------------------------------------------------------


class VersionHistoryRead(BaseModel):
    """Response model for a single version history entry."""

    id: int
    workout_plan_id: int
    version_number: int
    change_summary: str
    changed_at: datetime
    previous_snapshot: dict[str, Any]
    explanation: Optional[str] = Field(None, description="Human-readable reason for the change")

    model_config = {"from_attributes": True}


class RollbackRequest(BaseModel):
    """Request body for rolling back a plan to a specific version."""

    target_version: int = Field(..., ge=1, description="Version number to roll back to")


# ---------------------------------------------------------------------------
# Compare schemas
# ---------------------------------------------------------------------------


class ExerciseDiff(BaseModel):
    """Describes a change to a single exercise between two versions."""

    exercise_id: int
    exercise_name: Optional[str] = None
    change_type: str = Field(
        ..., description="One of: 'added', 'removed', 'modified'"
    )
    before: Optional[dict[str, Any]] = None
    after: Optional[dict[str, Any]] = None


class CompareResponse(BaseModel):
    """Response for a diff between two plan versions."""

    workout_plan_id: int
    version_a: int
    version_b: int
    exercises_added: List[ExerciseDiff] = []
    exercises_removed: List[ExerciseDiff] = []
    exercises_modified: List[ExerciseDiff] = []


# ---------------------------------------------------------------------------
# Workout log schemas
# ---------------------------------------------------------------------------


class ExercisePerformedEntry(BaseModel):
    """A single exercise entry recorded in a workout session."""

    exercise_id: int
    exercise_name: Optional[str] = None
    planned: Optional[dict[str, Any]] = Field(
        None, description="Planned sets/reps/weight for reference"
    )
    actual: dict[str, Any] = Field(
        ..., description="Actual sets/reps/weight performed"
    )


class WorkoutLogCreate(BaseModel):
    """Request body for logging a completed workout session."""

    workout_plan_id: Optional[int] = Field(
        None, description="Plan followed during this session (optional)"
    )
    date_completed: Optional[datetime] = Field(
        None, description="Defaults to now if omitted"
    )
    exercises_performed: List[ExercisePerformedEntry] = Field(
        ..., min_length=1, description="Exercises performed during the session"
    )


class WorkoutLogRead(BaseModel):
    """Response model for a recorded workout log entry."""

    id: int
    user_id: int
    workout_plan_id: Optional[int]
    date_completed: datetime
    exercises_performed: List[dict[str, Any]]

    model_config = {"from_attributes": True}


class WorkoutLogFilter(BaseModel):
    """Query parameters for filtering past workout logs."""

    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    muscle_group: Optional[str] = None
    exercise_id: Optional[int] = None


# ---------------------------------------------------------------------------
# Progress / chart schemas
# ---------------------------------------------------------------------------


class ChartDataPoint(BaseModel):
    """A single {date, value} data point for frontend charting."""

    date: str = Field(..., description="ISO-8601 date string (e.g. '2026-01-06')")
    value: float = Field(..., description="Aggregated metric value")


class ProgressResponse(BaseModel):
    """Response model for a progress chart dataset."""

    metric: str = Field(
        ..., description="One of: 'total_weight', 'total_volume', 'frequency'"
    )
    granularity: str = Field(..., description="One of: 'weekly', 'monthly'")
    data: List[ChartDataPoint]


# ---------------------------------------------------------------------------
# Generic response schemas
# ---------------------------------------------------------------------------


class MessageResponse(BaseModel):
    """Generic response carrying a status message."""

    message: str

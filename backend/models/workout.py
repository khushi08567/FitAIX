"""
SQLAlchemy ORM models for the Workout Tracker / Version Control feature.

Models:
    - Exercise
    - WorkoutPlan
    - WorkoutExercise
    - WorkoutLog
    - WorkoutVersionHistory
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Exercise(Base):
    """
    Represents a canonical exercise definition in the exercise library.

    Attributes:
        id:               Primary key.
        name:             Human-readable exercise name (e.g. "Bench Press").
        muscle_group:     Primary muscle group targeted (e.g. "Chest").
        equipment_needed: Equipment required (e.g. "Barbell", "Dumbbell", "None").
    """

    __tablename__ = "exercises"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(255), nullable=False, unique=True, index=True)
    muscle_group: str = Column(String(100), nullable=False, index=True)
    equipment_needed: str = Column(String(100), nullable=True, default="None")

    # Reverse relation — exercises used in workout plans
    workout_exercises: list = relationship(
        "WorkoutExercise", back_populates="exercise", cascade="all, delete-orphan"
    )


class WorkoutPlan(Base):
    """
    Represents a versioned workout plan owned by a user.

    Attributes:
        id:             Primary key.
        user_id:        Foreign key to the owning user.
        name:           Descriptive plan name.
        created_at:     UTC timestamp of initial creation.
        is_active:      Soft-delete flag; False = deleted.
        version_number: Monotonically increasing version counter.
    """

    __tablename__ = "workout_plans"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, nullable=False, index=True)
    name: str = Column(String(255), nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    version_number: int = Column(Integer, default=1, nullable=False)

    # Relations
    exercises: list = relationship(
        "WorkoutExercise", back_populates="workout_plan", cascade="all, delete-orphan"
    )
    logs: list = relationship(
        "WorkoutLog", back_populates="workout_plan"
    )
    version_history: list = relationship(
        "WorkoutVersionHistory",
        back_populates="workout_plan",
        cascade="all, delete-orphan",
    )


class WorkoutExercise(Base):
    """
    Represents a single exercise entry within a workout plan, including
    prescription details (sets, reps, weight, rest).

    Attributes:
        id:              Primary key.
        workout_plan_id: FK to the parent WorkoutPlan.
        exercise_id:     FK to the Exercise definition.
        sets:            Number of sets prescribed.
        reps:            Number of reps per set.
        weight:          Load in kilograms (or 0 for bodyweight).
        rest_seconds:    Rest duration between sets in seconds.
        order_index:     Display / execution ordering within the plan.
    """

    __tablename__ = "workout_exercises"

    id: int = Column(Integer, primary_key=True, index=True)
    workout_plan_id: int = Column(
        Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    exercise_id: int = Column(
        Integer, ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    sets: int = Column(Integer, nullable=False, default=3)
    reps: int = Column(Integer, nullable=False, default=10)
    weight: float = Column(Float, nullable=False, default=0.0)
    rest_seconds: int = Column(Integer, nullable=False, default=60)
    order_index: int = Column(Integer, nullable=False, default=0)

    # Relations
    workout_plan: "WorkoutPlan" = relationship("WorkoutPlan", back_populates="exercises")
    exercise: "Exercise" = relationship("Exercise", back_populates="workout_exercises")


class WorkoutLog(Base):
    """
    Records a completed workout session, capturing actual performance
    data versus planned values.

    Attributes:
        id:                  Primary key.
        user_id:             FK to the user who performed the workout.
        workout_plan_id:     FK to the WorkoutPlan that was followed (nullable —
                             a user may log a free-form session).
        date_completed:      UTC timestamp of session completion.
        exercises_performed: JSON blob capturing performed sets/reps/weight
                             alongside planned values per exercise.
                             Schema example::

                                 [
                                   {
                                     "exercise_id": 1,
                                     "exercise_name": "Bench Press",
                                     "planned": {"sets": 3, "reps": 10, "weight": 80.0},
                                     "actual":  {"sets": 3, "reps": 9,  "weight": 80.0}
                                   }
                                 ]
    """

    __tablename__ = "workout_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, nullable=False, index=True)
    workout_plan_id: int = Column(
        Integer, ForeignKey("workout_plans.id", ondelete="SET NULL"), nullable=True, index=True
    )
    date_completed: datetime = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    exercises_performed: list = Column(JSON, nullable=False, default=list)

    # Relations
    workout_plan: "WorkoutPlan" = relationship("WorkoutPlan", back_populates="logs")


class WorkoutVersionHistory(Base):
    """
    Audit trail capturing every change made to a WorkoutPlan.

    Each row stores a snapshot of the plan *before* the change was applied,
    enabling full rollback to any past version.

    Attributes:
        id:                Primary key.
        workout_plan_id:   FK to the WorkoutPlan.
        version_number:    The version number *after* this change was applied.
        change_summary:    Human-readable description of what changed and why.
        changed_at:        UTC timestamp of the change.
        previous_snapshot: JSON blob of the full plan state prior to this change.
                           Schema example::

                               {
                                 "name": "Push Day",
                                 "exercises": [
                                   {"exercise_id": 1, "sets": 3, "reps": 10, "weight": 80.0, ...}
                                 ]
                               }
    """

    __tablename__ = "workout_version_history"

    id: int = Column(Integer, primary_key=True, index=True)
    workout_plan_id: int = Column(
        Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: int = Column(Integer, nullable=False)
    change_summary: str = Column(Text, nullable=False)
    changed_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    previous_snapshot: dict = Column(JSON, nullable=False, default=dict)

    # Relations
    workout_plan: "WorkoutPlan" = relationship(
        "WorkoutPlan", back_populates="version_history"
    )

/**
 * workout.ts — TypeORM entities for the Workout Tracker / Version Control feature.
 *
 * Entities:
 *   - Exercise
 *   - WorkoutPlan
 *   - WorkoutExercise
 *   - WorkoutLog
 *   - WorkoutVersionHistory
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";

// ─────────────────────────────────────────────────────────────────────────────
// Exercise
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical exercise definition in the exercise library.
 */
@Entity("exercises")
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Human-readable exercise name, e.g. "Bench Press". */
  @Index()
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  /** Primary muscle group targeted, e.g. "Chest". */
  @Index()
  @Column({ type: "varchar", length: 100 })
  muscleGroup!: string;

  /** Equipment required, e.g. "Barbell", "Dumbbell", or "None". */
  @Column({ type: "varchar", length: 100, nullable: true, default: "None" })
  equipmentNeeded!: string;

  @OneToMany(() => WorkoutExercise, (we) => we.exercise, { cascade: true })
  workoutExercises!: WorkoutExercise[];
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutPlan
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A versioned workout plan owned by a user.
 * Soft-deletion is handled via the `isActive` flag.
 */
@Entity("workout_plans")
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  /** FK to the owning user (resolved by auth layer). */
  @Index()
  @Column({ type: "int" })
  userId!: number;

  /** Descriptive plan name. */
  @Column({ type: "varchar", length: 255 })
  name!: string;

  /** UTC timestamp of initial creation. */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Soft-delete flag.
   * `false` = plan has been deleted; never remove from DB so history is preserved.
   */
  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  /** Monotonically increasing version counter — incremented on every change. */
  @Column({ type: "int", default: 1 })
  versionNumber!: number;

  @OneToMany(() => WorkoutExercise, (we) => we.workoutPlan, { cascade: true, eager: true })
  exercises!: WorkoutExercise[];

  @OneToMany(() => WorkoutLog, (log) => log.workoutPlan)
  logs!: WorkoutLog[];

  @OneToMany(() => WorkoutVersionHistory, (v) => v.workoutPlan, { cascade: true })
  versionHistory!: WorkoutVersionHistory[];
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutExercise
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single exercise entry within a workout plan, including prescription
 * details: sets, reps, weight, rest time, and display order.
 */
@Entity("workout_exercises")
export class WorkoutExercise {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  workoutPlanId!: number;

  @Index()
  @Column({ type: "int" })
  exerciseId!: number;

  /** Number of sets prescribed. */
  @Column({ type: "int", default: 3 })
  sets!: number;

  /** Number of reps per set. */
  @Column({ type: "int", default: 10 })
  reps!: number;

  /** Load in kilograms; 0 = bodyweight. */
  @Column({ type: "float", default: 0.0 })
  weight!: number;

  /** Rest duration between sets in seconds. */
  @Column({ type: "int", default: 60 })
  restSeconds!: number;

  /** Display / execution order within the plan. */
  @Column({ type: "int", default: 0 })
  orderIndex!: number;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.exercises, { onDelete: "CASCADE" })
  @JoinColumn({ name: "workoutPlanId" })
  workoutPlan!: WorkoutPlan;

  @ManyToOne(() => Exercise, (ex) => ex.workoutExercises, { onDelete: "RESTRICT", eager: true })
  @JoinColumn({ name: "exerciseId" })
  exercise!: Exercise;
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutLog
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Captures a completed workout session — actual performance vs planned values.
 *
 * The `exercisesPerformed` JSON column stores an array of:
 * ```json
 * [
 *   {
 *     "exerciseId": 1,
 *     "exerciseName": "Bench Press",
 *     "planned": { "sets": 3, "reps": 10, "weight": 80 },
 *     "actual":  { "sets": 3, "reps": 9,  "weight": 80 }
 *   }
 * ]
 * ```
 */
@Entity("workout_logs")
export class WorkoutLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  userId!: number;

  /** The plan followed during this session; nullable for free-form sessions. */
  @Index()
  @Column({ type: "int", nullable: true })
  workoutPlanId!: number | null;

  @Index()
  @Column({ type: "timestamptz", default: () => "NOW()" })
  dateCompleted!: Date;

  /** Actual exercises performed — JSON array of performance entries. */
  @Column({ type: "jsonb", default: [] })
  exercisesPerformed!: Record<string, unknown>[];

  @ManyToOne(() => WorkoutPlan, (plan) => plan.logs, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "workoutPlanId" })
  workoutPlan!: WorkoutPlan | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutVersionHistory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Audit trail entry for every change applied to a WorkoutPlan.
 *
 * `previousSnapshot` stores the full plan state *before* the change so
 * the plan can be fully restored to any past version.
 *
 * Example snapshot:
 * ```json
 * {
 *   "name": "Push Day",
 *   "versionNumber": 2,
 *   "exercises": [
 *     { "exerciseId": 1, "sets": 3, "reps": 10, "weight": 80, ... }
 *   ]
 * }
 * ```
 */
@Entity("workout_version_history")
export class WorkoutVersionHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  workoutPlanId!: number;

  /** Version number *after* this change was applied. */
  @Column({ type: "int" })
  versionNumber!: number;

  /** Short description of what changed and why. */
  @Column({ type: "text" })
  changeSummary!: string;

  @CreateDateColumn()
  changedAt!: Date;

  /** Full plan state captured *before* this change was applied. */
  @Column({ type: "jsonb", default: {} })
  previousSnapshot!: Record<string, unknown>;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.versionHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "workoutPlanId" })
  workoutPlan!: WorkoutPlan;
}

/**
 * schemas.ts — Zod request/response schemas for the Workout Version Control feature.
 *
 * All request bodies are validated with Zod. Response types are inferred
 * from the same schemas to keep a single source of truth.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Exercise
// ─────────────────────────────────────────────────────────────────────────────

export const ExerciseCreateSchema = z.object({
  name: z.string().min(1).max(255),
  muscleGroup: z.string().min(1).max(100),
  equipmentNeeded: z.string().max(100).default("None"),
});

export const ExerciseReadSchema = ExerciseCreateSchema.extend({ id: z.number() });

export type ExerciseCreate = z.infer<typeof ExerciseCreateSchema>;
export type ExerciseRead = z.infer<typeof ExerciseReadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutExercise (prescription within a plan)
// ─────────────────────────────────────────────────────────────────────────────

export const WorkoutExerciseInputSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.number().int().min(1).default(3),
  reps: z.number().int().min(1).default(10),
  weight: z.number().min(0).default(0),
  restSeconds: z.number().int().min(0).default(60),
  orderIndex: z.number().int().min(0).default(0),
});

export const WorkoutExerciseReadSchema = WorkoutExerciseInputSchema.extend({
  id: z.number(),
  exercise: ExerciseReadSchema.optional(),
});

export type WorkoutExerciseInput = z.infer<typeof WorkoutExerciseInputSchema>;
export type WorkoutExerciseRead = z.infer<typeof WorkoutExerciseReadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutPlan
// ─────────────────────────────────────────────────────────────────────────────

export const WorkoutPlanCreateSchema = z.object({
  name: z.string().min(1).max(255),
  exercises: z.array(WorkoutExerciseInputSchema).min(1),
});

export const WorkoutPlanUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  exercises: z.array(WorkoutExerciseInputSchema).optional(),
});

export const WorkoutPlanReadSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
  versionNumber: z.number(),
  exercises: z.array(WorkoutExerciseReadSchema).default([]),
});

export const WorkoutPlanSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  versionNumber: z.number(),
  createdAt: z.coerce.date(),
});

export type WorkoutPlanCreate = z.infer<typeof WorkoutPlanCreateSchema>;
export type WorkoutPlanUpdate = z.infer<typeof WorkoutPlanUpdateSchema>;
export type WorkoutPlanRead = z.infer<typeof WorkoutPlanReadSchema>;
export type WorkoutPlanSummary = z.infer<typeof WorkoutPlanSummarySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Version History
// ─────────────────────────────────────────────────────────────────────────────

export const VersionHistoryReadSchema = z.object({
  id: z.number(),
  workoutPlanId: z.number(),
  versionNumber: z.number(),
  changeSummary: z.string(),
  changedAt: z.coerce.date(),
  previousSnapshot: z.record(z.unknown()),
  explanation: z.string().optional(),
});

export const RollbackRequestSchema = z.object({
  targetVersion: z.number().int().min(1),
});

export type VersionHistoryRead = z.infer<typeof VersionHistoryReadSchema>;
export type RollbackRequest = z.infer<typeof RollbackRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Compare
// ─────────────────────────────────────────────────────────────────────────────

export const ExerciseDiffSchema = z.object({
  exerciseId: z.number(),
  exerciseName: z.string().optional(),
  changeType: z.enum(["added", "removed", "modified"]),
  before: z.record(z.unknown()).nullable().optional(),
  after: z.record(z.unknown()).nullable().optional(),
});

export const CompareResponseSchema = z.object({
  workoutPlanId: z.number(),
  versionA: z.number(),
  versionB: z.number(),
  exercisesAdded: z.array(ExerciseDiffSchema).default([]),
  exercisesRemoved: z.array(ExerciseDiffSchema).default([]),
  exercisesModified: z.array(ExerciseDiffSchema).default([]),
});

export type ExerciseDiff = z.infer<typeof ExerciseDiffSchema>;
export type CompareResponse = z.infer<typeof CompareResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Workout Log
// ─────────────────────────────────────────────────────────────────────────────

export const ExercisePerformedEntrySchema = z.object({
  exerciseId: z.number().int().positive(),
  exerciseName: z.string().optional(),
  planned: z.record(z.unknown()).optional(),
  actual: z.record(z.unknown()),
});

export const WorkoutLogCreateSchema = z.object({
  workoutPlanId: z.number().int().positive().optional(),
  dateCompleted: z.coerce.date().optional(),
  exercisesPerformed: z.array(ExercisePerformedEntrySchema).min(1),
});

export const WorkoutLogReadSchema = z.object({
  id: z.number(),
  userId: z.number(),
  workoutPlanId: z.number().nullable(),
  dateCompleted: z.coerce.date(),
  exercisesPerformed: z.array(z.record(z.unknown())),
});

export type ExercisePerformedEntry = z.infer<typeof ExercisePerformedEntrySchema>;
export type WorkoutLogCreate = z.infer<typeof WorkoutLogCreateSchema>;
export type WorkoutLogRead = z.infer<typeof WorkoutLogReadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Progress / Chart
// ─────────────────────────────────────────────────────────────────────────────

export const ChartDataPointSchema = z.object({
  /** ISO-8601 date string, e.g. "2026-01-06". */
  date: z.string(),
  value: z.number(),
});

export const ProgressResponseSchema = z.object({
  metric: z.enum(["total_weight", "total_volume", "frequency"]),
  granularity: z.enum(["weekly", "monthly"]),
  data: z.array(ChartDataPointSchema),
});

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;
export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Generic
// ─────────────────────────────────────────────────────────────────────────────

export const MessageResponseSchema = z.object({ message: z.string() });
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

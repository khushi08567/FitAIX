/**
 * actions/update.ts — Edit an existing workout plan.
 *
 * Updating a plan automatically snapshots the previous state into
 * WorkoutVersionHistory before applying any changes.
 */

import { DataSource } from "typeorm";
import { WorkoutPlan, WorkoutExercise } from "../../../models/workout";
import { WorkoutPlanUpdate, WorkoutPlanRead } from "../schemas";
import { recordVersion } from "../history";
import { serializePlan } from "./create";

/**
 * Builds a JSON-serialisable snapshot of a plan's current state.
 *
 * The snapshot is stored as `previousSnapshot` in WorkoutVersionHistory
 * *before* any mutation is applied.
 *
 * @param plan WorkoutPlan entity with exercises eagerly loaded.
 * @returns    Plain-object snapshot of the plan.
 */
export function snapshotPlan(plan: WorkoutPlan): Record<string, unknown> {
  return {
    name: plan.name,
    versionNumber: plan.versionNumber,
    exercises: (plan.exercises ?? []).map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
      orderIndex: ex.orderIndex,
    })),
  };
}

/**
 * Edit the name or exercise list of an existing workout plan.
 *
 * Workflow:
 *  1. Fetch plan and verify ownership + active status.
 *  2. Snapshot current state.
 *  3. Apply requested changes (name and/or exercise list).
 *  4. Increment `versionNumber`.
 *  5. Record a WorkoutVersionHistory entry via `recordVersion`.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user (ownership check).
 * @param planId     Primary key of the plan to update.
 * @param payload    Partial update — omit fields to leave them unchanged.
 * @returns          Updated WorkoutPlanRead DTO.
 * @throws           404 if plan not found / not owned; 410 if deleted.
 */
export async function updateWorkoutPlan(
  dataSource: DataSource,
  userId: number,
  planId: number,
  payload: WorkoutPlanUpdate
): Promise<WorkoutPlanRead> {
  const planRepo = dataSource.getRepository(WorkoutPlan);
  const exerciseRepo = dataSource.getRepository(WorkoutExercise);

  const plan = await planRepo.findOne({
    where: { id: planId, userId },
    relations: ["exercises"],
  });

  if (!plan) {
    const err: any = new Error(
      `Workout plan ${planId} not found or does not belong to you.`
    );
    err.statusCode = 404;
    throw err;
  }
  if (!plan.isActive) {
    const err: any = new Error(
      `Workout plan ${planId} has been deleted and cannot be modified.`
    );
    err.statusCode = 410;
    throw err;
  }

  // ── 1. Snapshot before mutation ───────────────────────────────────────────
  const snapshot = snapshotPlan(plan);
  const changedFields: string[] = [];

  // ── 2. Apply changes ──────────────────────────────────────────────────────
  if (payload.name !== undefined && payload.name !== plan.name) {
    changedFields.push(`name changed from '${plan.name}' to '${payload.name}'`);
    plan.name = payload.name;
  }

  if (payload.exercises !== undefined) {
    // Replace exercise list entirely
    await exerciseRepo.delete({ workoutPlanId: plan.id });

    const newExercises = payload.exercises.map((ex) =>
      exerciseRepo.create({
        workoutPlanId: plan.id,
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restSeconds: ex.restSeconds,
        orderIndex: ex.orderIndex,
      })
    );
    await exerciseRepo.save(newExercises);
    changedFields.push(`exercise list updated (${newExercises.length} exercises)`);
  }

  // Nothing actually changed — return current state without bumping version
  if (changedFields.length === 0) {
    return serializePlan(plan);
  }

  // ── 3. Increment version ──────────────────────────────────────────────────
  plan.versionNumber += 1;
  await planRepo.save(plan);

  // ── 4. Record history entry ───────────────────────────────────────────────
  await recordVersion(
    dataSource,
    plan.id,
    plan.versionNumber,
    `Manual edit: ${changedFields.join("; ")}`,
    snapshot,
    "manual_edit"
  );

  // Re-fetch with full relations for the response
  const updated = await planRepo.findOne({
    where: { id: plan.id },
    relations: ["exercises", "exercises.exercise"],
  });

  return serializePlan(updated!);
}

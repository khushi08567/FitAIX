/**
 * actions/rollback.ts — Revert a workout plan to a previous version snapshot.
 *
 * Restores the plan's exercise list from a stored WorkoutVersionHistory
 * snapshot, then records the rollback itself as a new version entry so the
 * full audit trail is never broken.
 */

import { DataSource } from "typeorm";
import { WorkoutPlan, WorkoutExercise, WorkoutVersionHistory } from "../../../models/workout";
import { RollbackRequest, WorkoutPlanRead } from "../schemas";
import { recordVersion } from "../history";
import { snapshotPlan } from "./update";
import { serializePlan } from "./create";

/**
 * Revert a workout plan to the state captured in a previous version snapshot.
 *
 * Workflow:
 *  1. Verify ownership and that the plan is active.
 *  2. Load the WorkoutVersionHistory entry for `targetVersion`.
 *  3. Snapshot the *current* state (stored as the new history entry's previous state).
 *  4. Delete current WorkoutExercise rows and rebuild from the target snapshot.
 *  5. Restore plan name from snapshot; increment `versionNumber`.
 *  6. Record a "rollback" version history entry.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user (ownership check).
 * @param planId     ID of the WorkoutPlan to roll back.
 * @param payload    Contains the `targetVersion` to restore.
 * @returns          The restored WorkoutPlanRead DTO with new version number.
 * @throws           404 if plan or target version not found; 410 if deleted; 400 if same version.
 */
export async function rollbackWorkoutPlan(
  dataSource: DataSource,
  userId: number,
  planId: number,
  payload: RollbackRequest
): Promise<WorkoutPlanRead> {
  const planRepo = dataSource.getRepository(WorkoutPlan);
  const exerciseRepo = dataSource.getRepository(WorkoutExercise);
  const histRepo = dataSource.getRepository(WorkoutVersionHistory);

  // ── 1. Fetch plan ──────────────────────────────────────────────────────────
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
      `Workout plan ${planId} is deleted and cannot be rolled back.`
    );
    err.statusCode = 410;
    throw err;
  }
  if (payload.targetVersion === plan.versionNumber) {
    const err: any = new Error(`Plan is already at version ${payload.targetVersion}.`);
    err.statusCode = 400;
    throw err;
  }

  // ── 2. Load target snapshot ────────────────────────────────────────────────
  const historyEntry = await histRepo.findOne({
    where: { workoutPlanId: planId, versionNumber: payload.targetVersion },
  });

  if (!historyEntry) {
    const err: any = new Error(
      `Version ${payload.targetVersion} not found for plan ${planId}. ` +
        "Cannot roll back to a non-existent snapshot."
    );
    err.statusCode = 404;
    throw err;
  }

  const targetSnapshot = historyEntry.previousSnapshot;

  // ── 3. Snapshot current state ──────────────────────────────────────────────
  const currentSnapshot = snapshotPlan(plan);

  // ── 4. Replace exercise rows ───────────────────────────────────────────────
  await exerciseRepo.delete({ workoutPlanId: plan.id });

  const restoredExercises = (
    (targetSnapshot.exercises ?? []) as Record<string, unknown>[]
  ).map((ex) =>
    exerciseRepo.create({
      workoutPlanId: plan.id,
      exerciseId: ex.exerciseId as number,
      sets: (ex.sets as number) ?? 3,
      reps: (ex.reps as number) ?? 10,
      weight: (ex.weight as number) ?? 0,
      restSeconds: (ex.restSeconds as number) ?? 60,
      orderIndex: (ex.orderIndex as number) ?? 0,
    })
  );
  await exerciseRepo.save(restoredExercises);

  // ── 5. Update plan metadata ────────────────────────────────────────────────
  if (targetSnapshot.name) plan.name = targetSnapshot.name as string;
  plan.versionNumber += 1;
  await planRepo.save(plan);

  // ── 6. Record rollback in history ─────────────────────────────────────────
  await recordVersion(
    dataSource,
    plan.id,
    plan.versionNumber,
    `Rolled back to version ${payload.targetVersion} ` +
      `(previous version was ${currentSnapshot.versionNumber}).`,
    currentSnapshot,
    "rollback"
  );

  // Re-fetch with full relations for the response
  const restored = await planRepo.findOne({
    where: { id: plan.id },
    relations: ["exercises", "exercises.exercise"],
  });

  return serializePlan(restored!);
}

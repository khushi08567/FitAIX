/**
 * actions/delete.ts — Soft-delete a workout plan.
 *
 * Hard deletion is explicitly prohibited. Setting `isActive = false` is the
 * only mutation; all exercises, logs, and version history are preserved in
 * the database permanently.
 */

import { DataSource } from "typeorm";
import { WorkoutPlan } from "../../../models/workout";
import { MessageResponse } from "../schemas";
import { recordVersion } from "../history";
import { snapshotPlan } from "./update";

/**
 * Soft-delete a workout plan by marking it inactive.
 *
 * The plan record, exercise rows, logs, and full version history are
 * **never removed**. A deletion entry is added to WorkoutVersionHistory
 * to preserve the audit trail.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user (ownership check).
 * @param planId     Primary key of the plan to soft-delete.
 * @returns          Confirmation message.
 * @throws           404 if plan not found / not owned; 409 if already deleted.
 */
export async function softDeleteWorkoutPlan(
  dataSource: DataSource,
  userId: number,
  planId: number
): Promise<MessageResponse> {
  const planRepo = dataSource.getRepository(WorkoutPlan);

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
    const err: any = new Error(`Workout plan ${planId} is already deleted.`);
    err.statusCode = 409;
    throw err;
  }

  // Snapshot the current state before marking deleted
  const snapshot = snapshotPlan(plan);

  // Soft delete
  plan.isActive = false;
  plan.versionNumber += 1;
  await planRepo.save(plan);

  // Record deletion in version history
  await recordVersion(
    dataSource,
    plan.id,
    plan.versionNumber,
    "Plan soft-deleted by user.",
    snapshot,
    "deletion"
  );

  return { message: `Workout plan '${plan.name}' has been deleted.` };
}

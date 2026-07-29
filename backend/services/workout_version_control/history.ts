/**
 * history.ts — Workout plan version history management.
 *
 * Provides:
 *   - recordVersion      Persist a new WorkoutVersionHistory entry.
 *   - getVersionHistory  Fetch the full audit trail for a plan, enriched
 *                        with human-readable explanations via explanation_link.
 */

import { DataSource } from "typeorm";
import { WorkoutVersionHistory } from "../../models/workout";
import { WorkoutPlan } from "../../models/workout";
import { VersionHistoryRead } from "./schemas";
import { getExplanation, ChangeType } from "./explanation_link";

/**
 * Persists a new version history entry before (or alongside) a plan mutation.
 *
 * Called by create, update, delete, and rollback actions. The caller is
 * responsible for committing the surrounding transaction.
 *
 * @param dataSource       TypeORM DataSource (injected).
 * @param planId           ID of the WorkoutPlan being versioned.
 * @param newVersion       Version number *after* the change is applied.
 * @param changeSummary    Short description of what changed.
 * @param previousSnapshot JSON snapshot of the plan state *before* the change.
 * @param changeType       Category code used by explanation_link (default: "manual_edit").
 * @returns                The saved WorkoutVersionHistory entity.
 */
export async function recordVersion(
  dataSource: DataSource,
  planId: number,
  newVersion: number,
  changeSummary: string,
  previousSnapshot: Record<string, unknown>,
  changeType: ChangeType = "manual_edit"
): Promise<WorkoutVersionHistory> {
  const repo = dataSource.getRepository(WorkoutVersionHistory);

  // Embed the changeType inside the snapshot so it can be recovered on read
  const enrichedSnapshot = { ...previousSnapshot, _changeType: changeType };

  const entry = repo.create({
    workoutPlanId: planId,
    versionNumber: newVersion,
    changeSummary,
    previousSnapshot: enrichedSnapshot,
  });

  return repo.save(entry);
}

/**
 * Retrieves the full ordered version history for a workout plan.
 *
 * Verifies plan ownership before querying. Each entry is enriched with a
 * human-readable explanation from {@link getExplanation}.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user (ownership check).
 * @param planId     ID of the WorkoutPlan whose history to retrieve.
 * @returns          Array of VersionHistoryRead DTOs ordered oldest → newest.
 * @throws           404 error object if plan is not found / not owned.
 */
export async function getVersionHistory(
  dataSource: DataSource,
  userId: number,
  planId: number
): Promise<VersionHistoryRead[]> {
  const planRepo = dataSource.getRepository(WorkoutPlan);
  const plan = await planRepo.findOne({ where: { id: planId, userId } });

  if (!plan) {
    const err: any = new Error(
      `Workout plan ${planId} not found or does not belong to you.`
    );
    err.statusCode = 404;
    throw err;
  }

  const historyRepo = dataSource.getRepository(WorkoutVersionHistory);
  const entries = await historyRepo.find({
    where: { workoutPlanId: planId },
    order: { versionNumber: "ASC" },
  });

  return entries.map((entry) => {
    const changeType = (entry.previousSnapshot._changeType as ChangeType) ?? "unknown";

    // Strip internal metadata key from the exposed snapshot
    const { _changeType, ...snapshotClean } = entry.previousSnapshot;

    return {
      id: entry.id,
      workoutPlanId: entry.workoutPlanId,
      versionNumber: entry.versionNumber,
      changeSummary: entry.changeSummary,
      changedAt: entry.changedAt,
      previousSnapshot: snapshotClean,
      explanation: getExplanation(changeType, entry.changeSummary),
    };
  });
}

/**
 * actions/compare.ts — Diff two versions of a workout plan.
 *
 * Compares snapshots stored in WorkoutVersionHistory and returns a structured
 * diff of exercises added, removed, or modified between two versions.
 */

import { DataSource } from "typeorm";
import { WorkoutPlan, WorkoutVersionHistory } from "../../../models/workout";
import { CompareResponse, ExerciseDiff } from "../schemas";

type ExerciseSnapshot = Record<string, unknown>;

/**
 * Indexes a snapshot's exercise array by `exerciseId` for quick lookup.
 * @internal
 */
function buildExerciseMap(snapshot: Record<string, unknown>): Map<number, ExerciseSnapshot> {
  const exercises = (snapshot.exercises ?? []) as ExerciseSnapshot[];
  return new Map(exercises.map((ex) => [ex.exerciseId as number, ex]));
}

/**
 * Prescription fields compared between two snapshots.
 * @internal
 */
const PRESCRIPTION_KEYS = ["sets", "reps", "weight", "restSeconds", "orderIndex"] as const;

/**
 * Compare two versions of a workout plan and return a structured diff.
 *
 * Diff categories:
 * - **exercisesAdded**    — present in versionB, absent in versionA.
 * - **exercisesRemoved**  — present in versionA, absent in versionB.
 * - **exercisesModified** — present in both but with different prescription.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user (ownership check).
 * @param planId     ID of the WorkoutPlan to compare.
 * @param versionA   Older (or equal) version number.
 * @param versionB   Newer (or equal) version number.
 * @returns          CompareResponse with three categorised diff lists.
 * @throws           400 if versionA > versionB; 404 if plan/version not found.
 */
export async function compareVersions(
  dataSource: DataSource,
  userId: number,
  planId: number,
  versionA: number,
  versionB: number
): Promise<CompareResponse> {
  if (versionA > versionB) {
    const err: any = new Error("versionA must be less than or equal to versionB.");
    err.statusCode = 400;
    throw err;
  }

  // Ownership check
  const planRepo = dataSource.getRepository(WorkoutPlan);
  const plan = await planRepo.findOne({ where: { id: planId, userId } });
  if (!plan) {
    const err: any = new Error(
      `Workout plan ${planId} not found or does not belong to you.`
    );
    err.statusCode = 404;
    throw err;
  }

  // Fetch both history entries
  const histRepo = dataSource.getRepository(WorkoutVersionHistory);
  const entries = await histRepo
    .createQueryBuilder("h")
    .where("h.workoutPlanId = :planId", { planId })
    .andWhere("h.versionNumber IN (:...versions)", { versions: [versionA, versionB] })
    .getMany();

  const byVersion = new Map(entries.map((e) => [e.versionNumber, e]));

  if (!byVersion.has(versionA)) {
    const err: any = new Error(`Version ${versionA} not found for plan ${planId}.`);
    err.statusCode = 404;
    throw err;
  }
  if (!byVersion.has(versionB)) {
    const err: any = new Error(`Version ${versionB} not found for plan ${planId}.`);
    err.statusCode = 404;
    throw err;
  }

  const mapA = buildExerciseMap(byVersion.get(versionA)!.previousSnapshot);
  const mapB = buildExerciseMap(byVersion.get(versionB)!.previousSnapshot);

  const idsA = new Set(mapA.keys());
  const idsB = new Set(mapB.keys());

  const exercisesAdded: ExerciseDiff[] = [...idsB]
    .filter((id) => !idsA.has(id))
    .map((id) => ({ exerciseId: id, changeType: "added" as const, before: null, after: mapB.get(id) }));

  const exercisesRemoved: ExerciseDiff[] = [...idsA]
    .filter((id) => !idsB.has(id))
    .map((id) => ({ exerciseId: id, changeType: "removed" as const, before: mapA.get(id), after: null }));

  const exercisesModified: ExerciseDiff[] = [];
  for (const id of idsA) {
    if (!idsB.has(id)) continue;
    const before = mapA.get(id)!;
    const after = mapB.get(id)!;
    const changed = PRESCRIPTION_KEYS.some((k) => before[k] !== after[k]);
    if (changed) {
      exercisesModified.push({ exerciseId: id, changeType: "modified", before, after });
    }
  }

  return {
    workoutPlanId: planId,
    versionA,
    versionB,
    exercisesAdded,
    exercisesRemoved,
    exercisesModified,
  };
}

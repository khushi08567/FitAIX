/**
 * logs.ts — Past completed workout logs (actual performance records).
 *
 * Exports:
 *   - logCompletedWorkout  Persist a session's actual performance data.
 *   - getWorkoutLogs       Retrieve past logs with optional filters.
 */

import { DataSource, FindOptionsWhere, Between, And, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { WorkoutLog, Exercise } from "../../models/workout";
import { WorkoutLogCreate, WorkoutLogRead } from "./schemas";

/**
 * Record a completed workout session for the authenticated user.
 *
 * Each log entry captures exercises actually performed — sets, reps, weight —
 * alongside planned values. `dateCompleted` defaults to the current UTC time
 * if omitted.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the authenticated user.
 * @param payload    Validated log creation request.
 * @returns          The newly created WorkoutLogRead DTO.
 * @throws           400 if exercisesPerformed is empty (schema already guards this).
 */
export async function logCompletedWorkout(
  dataSource: DataSource,
  userId: number,
  payload: WorkoutLogCreate
): Promise<WorkoutLogRead> {
  const logRepo = dataSource.getRepository(WorkoutLog);

  const log = logRepo.create({
    userId,
    workoutPlanId: payload.workoutPlanId ?? null,
    dateCompleted: payload.dateCompleted ?? new Date(),
    exercisesPerformed: payload.exercisesPerformed.map((e) => ({ ...e })),
  });

  const saved = await logRepo.save(log);
  return serializeLog(saved);
}

/**
 * Retrieve past workout session logs for the authenticated user.
 *
 * Supports filtering by:
 * - **date range** (`dateFrom` / `dateTo`)
 * - **exerciseId** — logs that include the specific exercise.
 * - **muscleGroup** — logs that include at least one exercise targeting the group.
 *
 * Muscle group filtering resolves matching exercise IDs from the `exercises`
 * table and then filters in application memory to avoid dialect-specific JSON
 * query operators.
 *
 * @param dataSource  TypeORM DataSource (injected).
 * @param userId      ID of the authenticated user.
 * @param dateFrom    Include logs on or after this date.
 * @param dateTo      Include logs on or before this date.
 * @param muscleGroup Case-insensitive partial match on muscle group.
 * @param exerciseId  Filter to logs containing this exercise.
 * @param limit       Max results (default 50).
 * @param offset      Pagination offset (default 0).
 * @returns           Array of WorkoutLogRead DTOs, newest first.
 */
export async function getWorkoutLogs(
  dataSource: DataSource,
  userId: number,
  dateFrom?: Date,
  dateTo?: Date,
  muscleGroup?: string,
  exerciseId?: number,
  limit = 50,
  offset = 0
): Promise<WorkoutLogRead[]> {
  const logRepo = dataSource.getRepository(WorkoutLog);

  // Build date range condition
  let dateCondition: any = undefined;
  if (dateFrom && dateTo) {
    dateCondition = Between(dateFrom, dateTo);
  } else if (dateFrom) {
    dateCondition = MoreThanOrEqual(dateFrom);
  } else if (dateTo) {
    dateCondition = LessThanOrEqual(dateTo);
  }

  const where: FindOptionsWhere<WorkoutLog> = { userId };
  if (dateCondition) where.dateCompleted = dateCondition;

  let logs = await logRepo.find({
    where,
    order: { dateCompleted: "DESC" },
    take: limit,
    skip: offset,
  });

  // ── Post-fetch filters on JSON column ─────────────────────────────────────

  if (exerciseId !== undefined) {
    logs = logs.filter((log) =>
      (log.exercisesPerformed as any[]).some((e) => e.exerciseId === exerciseId)
    );
  }

  if (muscleGroup !== undefined) {
    // Resolve exercise IDs that match the requested muscle group
    const exerciseRepo = dataSource.getRepository(Exercise);
    const matched = await exerciseRepo
      .createQueryBuilder("e")
      .select("e.id")
      .where("LOWER(e.muscleGroup) LIKE :mg", {
        mg: `%${muscleGroup.toLowerCase()}%`,
      })
      .getMany();

    const matchingIds = new Set(matched.map((e) => e.id));

    logs = logs.filter((log) =>
      (log.exercisesPerformed as any[]).some((e) => matchingIds.has(e.exerciseId))
    );
  }

  return logs.map(serializeLog);
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Converts a WorkoutLog entity to a plain WorkoutLogRead DTO.
 * @internal
 */
function serializeLog(log: WorkoutLog): WorkoutLogRead {
  return {
    id: log.id,
    userId: log.userId,
    workoutPlanId: log.workoutPlanId,
    dateCompleted: log.dateCompleted,
    exercisesPerformed: log.exercisesPerformed,
  };
}

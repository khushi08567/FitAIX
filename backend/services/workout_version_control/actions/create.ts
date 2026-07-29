/**
 * actions/create.ts — Workout plan creation logic.
 *
 * Exports:
 *   - createWorkoutPlan       Manually build a plan from user-supplied exercises.
 *   - createWorkoutPlanWithAI Stub for future AI-assisted creation.
 */

import { DataSource } from "typeorm";
import { WorkoutPlan, WorkoutExercise } from "../../../models/workout";
import { WorkoutPlanCreate, WorkoutPlanRead } from "../schemas";
import { recordVersion } from "../history";

/**
 * Manually create a new workout plan for the authenticated user.
 *
 * Persists a WorkoutPlan along with its ordered WorkoutExercise rows.
 * Initial version number is always 1; the plan is active by default.
 * A "creation" version history entry is recorded immediately.
 *
 * @param dataSource TypeORM DataSource (injected).
 * @param userId     ID of the currently authenticated user.
 * @param payload    Validated create payload: plan name + exercise list.
 * @returns          The newly created plan as a WorkoutPlanRead DTO.
 */
export async function createWorkoutPlan(
  dataSource: DataSource,
  userId: number,
  payload: WorkoutPlanCreate
): Promise<WorkoutPlanRead> {
  const planRepo = dataSource.getRepository(WorkoutPlan);
  const exerciseRepo = dataSource.getRepository(WorkoutExercise);

  // Persist the plan
  const plan = planRepo.create({
    userId,
    name: payload.name,
    isActive: true,
    versionNumber: 1,
  });
  const savedPlan = await planRepo.save(plan);

  // Persist ordered exercise rows
  const exerciseRows = payload.exercises.map((ex) =>
    exerciseRepo.create({
      workoutPlanId: savedPlan.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
      orderIndex: ex.orderIndex,
    })
  );
  await exerciseRepo.save(exerciseRows);

  // Record creation in version history (snapshot is empty for v1 — no prior state)
  await recordVersion(
    dataSource,
    savedPlan.id,
    1,
    `Plan '${savedPlan.name}' created manually by user.`,
    {},
    "creation"
  );

  // Re-fetch with relations for the response
  const full = await planRepo.findOne({
    where: { id: savedPlan.id },
    relations: ["exercises", "exercises.exercise"],
  });

  return serializePlan(full!);
}

/**
 * **STUB** — AI-assisted workout plan creation.
 *
 * @remarks
 * TODO: This function depends on the `01_adaptive_planning_engine` service
 * which is not yet implemented. When that service is ready, replace this stub
 * with a call to its planning API, passing `userGoals` and receiving a
 * structured exercise prescription to persist via {@link createWorkoutPlan}.
 *
 * @param dataSource TypeORM DataSource.
 * @param userId     ID of the authenticated user.
 * @param userGoals  Object describing fitness goals, experience level, equipment, etc.
 */
export async function createWorkoutPlanWithAI(
  dataSource: DataSource,
  userId: number,
  userGoals: Record<string, unknown>
): Promise<never> {
  // TODO: Integrate with 01_adaptive_planning_engine to generate a
  //       personalised workout plan based on userGoals.
  throw new Error(
    "AI-assisted workout creation is not yet available. " +
      "This depends on 01_adaptive_planning_engine."
  );
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Converts a WorkoutPlan ORM entity to a plain WorkoutPlanRead DTO.
 * @internal
 */
export function serializePlan(plan: WorkoutPlan): WorkoutPlanRead {
  return {
    id: plan.id,
    userId: plan.userId,
    name: plan.name,
    createdAt: plan.createdAt,
    isActive: plan.isActive,
    versionNumber: plan.versionNumber,
    exercises: (plan.exercises ?? []).map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
      orderIndex: ex.orderIndex,
      exercise: ex.exercise
        ? {
            id: ex.exercise.id,
            name: ex.exercise.name,
            muscleGroup: ex.exercise.muscleGroup,
            equipmentNeeded: ex.exercise.equipmentNeeded,
          }
        : undefined,
    })),
  };
}

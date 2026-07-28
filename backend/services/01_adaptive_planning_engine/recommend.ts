import { parseSchedule } from "./signals/schedule";
import { getBasePool } from "./signals/equipment";
import { applyInjurySubstitutions } from "./signals/injury_history";
import { checkConsistency } from "./signals/missed_workouts";
import { executeRulesEngine } from "./rules";
import { buildWorkoutSession, WorkoutSession } from "./generator";

export interface DailyConditionInput {
    sleep_hours: number;
    soreness: 'Low' | 'Medium' | 'High';
    missed_workouts: number;
    injury: 'None' | 'Knee' | 'Shoulder' | 'Lower Back';
    available_time: '20 min' | '30 min' | '45 min' | '60 min';
    equipment: 'Home' | 'Gym' | 'Travel-No Equipment';
    goal: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Strength';
}

export interface ExplanationEntry {
    factor: string;
    observation: string;
    decision: string;
}

export interface RecommendationResponse {
    status: string;
    workout: WorkoutSession;
    explanations: ExplanationEntry[];
}

/**
 * Main orchestration function mapping client-side bio-metric conditions
 * to a tailored workout recommendation plan with full explanation trace checkpoints.
 */
export function generateWorkoutRecommendation(input: DailyConditionInput): RecommendationResponse {
    const explanations: ExplanationEntry[] = [];

    // 1. Evaluate Rule Engine & Recommended Recovery Score
    const ruleState = executeRulesEngine(input);

    // 2. Parse consistency patterns
    const consistencyState = checkConsistency(input.missed_workouts);
    if (consistencyState.explanation) {
        explanations.push(consistencyState.explanation);
    }

    // 3. Low recovery check checks
    if (ruleState.lowRecovery) {
        explanations.push({
            factor: "Recovery Score & Sleep",
            observation: `Sleep: ${input.sleep_hours} hrs | Recovery: ${ruleState.computedRecovery}%`,
            decision: "Below optimal threshold. Reduced volume by 1 set across remaining exercises and lowered target intensity to prevent injury."
        });
    }

    // 4. Parse Schedule limit
    const scheduleState = parseSchedule(input.available_time);
    if (scheduleState.explanation) {
        explanations.push(scheduleState.explanation);
    }

    // 5. Load base exercise pool
    const basePool = getBasePool(input.equipment, input.goal);
    const selectedExercises = basePool.slice(0, scheduleState.targetCount).map(ex => ({ ...ex }));

    // 6. Apply injury substitutions
    const injuryState = applyInjurySubstitutions(selectedExercises, input.injury, input.equipment);
    if (injuryState.explanation) {
        explanations.push(injuryState.explanation);
    }

    // 7. Add baseline explanation if no flags are active
    if (!ruleState.flagsActive && !scheduleState.explanation) {
        explanations.push({
            factor: "Baseline Performance",
            observation: "All parameters (Sleep, Recovery, Soreness, Injury) at optimal levels",
            decision: "Approved standard progression path. Target sets, intensity, and volume are set to 100% capacity."
        });
    }

    // 8. Generate session workout
    const workout = buildWorkoutSession(
        injuryState.substitutedExercises,
        input.goal,
        input.available_time,
        input.equipment,
        {
            computedRecovery: ruleState.computedRecovery,
            lowRecovery: ruleState.lowRecovery,
            highSoreness: ruleState.highSoreness,
            isReentry: consistencyState.isReentry,
            injury: input.injury
        }
    );

    return {
        status: "success",
        workout,
        explanations
    };
}

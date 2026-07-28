export interface MissedWorkoutsResult {
    isReentry: boolean;
    cappedSets: number | null;
    explanation?: {
        factor: string;
        observation: string;
        decision: string;
    };
}

/**
 * Checks consistency based on the number of missed workouts.
 * If consistency drops below key thresholds, it triggers a Re-entry protocol to scale load safely.
 */
export function checkConsistency(missedWorkouts: number): MissedWorkoutsResult {
    if (missedWorkouts >= 3) {
        return {
            isReentry: true,
            cappedSets: 2,
            explanation: {
                factor: "Consistency Pattern",
                observation: `${missedWorkouts} workouts missed this week`,
                decision: "Activated Re-entry Protocol. Capped target sets at 2 and adjusted RPE to 6-7 (low-moderate intensity) to restore physical adaptation."
            }
        };
    }
    return {
        isReentry: false,
        cappedSets: null
    };
}

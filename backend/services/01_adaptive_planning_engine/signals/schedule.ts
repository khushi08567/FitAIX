export interface ScheduleSignalResult {
    targetCount: number;
    explanation?: {
        factor: string;
        observation: string;
        decision: string;
    };
}

/**
 * Maps time availability constraints to the target number of exercises.
 */
export function parseSchedule(timeLimit: string): ScheduleSignalResult {
    let targetCount = 5;
    if (timeLimit === "20 min") targetCount = 3;
    else if (timeLimit === "30 min") targetCount = 4;
    else if (timeLimit === "45 min") targetCount = 5;
    else if (timeLimit === "60 min") targetCount = 6;

    let explanation;
    if (timeLimit === "20 min" || timeLimit === "30 min") {
        explanation = {
            factor: "Time Constraint",
            observation: `Restricted window (${timeLimit})`,
            decision: `Capped total movements at ${targetCount} to complete workout within available timeframe.`
        };
    }

    return { targetCount, explanation };
}

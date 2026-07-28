export interface SleepSignalResult {
    lowSleep: boolean;
    reductionSets: number;
    explanation?: {
        factor: string;
        observation: string;
        decision: string;
    };
}

/**
 * Analyzes the sleep duration signal.
 * Low sleep triggers a nervous system flag and reduces baseline exercise sets.
 */
export function analyzeSleep(sleepHours: number): SleepSignalResult {
    if (sleepHours < 5.0) {
        return {
            lowSleep: true,
            reductionSets: 1,
            explanation: {
                factor: "Sleep Hours",
                observation: `Sleep: ${sleepHours} hrs`,
                decision: "Critical sleep deprivation detected. Reduced volume by 1 set across exercises to protect nervous system recovery."
            }
        };
    }
    return {
        lowSleep: false,
        reductionSets: 0
    };
}

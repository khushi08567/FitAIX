import { DailyConditionInput } from "./recommend";

export interface RulesEngineResult {
    computedRecovery: number;
    lowRecovery: boolean;
    highSoreness: boolean;
    flagsActive: boolean;
}

/**
 * Runs constraint logic check rules across sleep, soreness, missed workouts, and injury inputs.
 * Dynamically recommends the recovery score as an engine output.
 */
export function executeRulesEngine(input: DailyConditionInput): RulesEngineResult {
    // 1. Calculate recovery score dynamically
    let recovery = 80; // Base score

    if (input.sleep_hours >= 8.0) {
        recovery += 10;
    } else if (input.sleep_hours >= 7.0) {
        recovery += 0;
    } else if (input.sleep_hours >= 6.0) {
        recovery -= 10;
    } else {
        recovery -= 25;
    }

    if (input.soreness === "Low") {
        recovery += 8;
    } else if (input.soreness === "High") {
        recovery -= 20;
    }

    if (input.missed_workouts >= 3) {
        recovery -= 15;
    }

    if (input.injury !== "None") {
        recovery -= 10;
    }

    const computedRecovery = Math.max(15, Math.min(98, recovery));

    // 2. Evaluate flag states
    const lowRecovery = computedRecovery < 50 || input.sleep_hours < 5.0;
    const highSoreness = input.soreness === "High";
    const flagsActive = lowRecovery || highSoreness || input.missed_workouts >= 3 || input.injury !== "None";

    return {
        computedRecovery,
        lowRecovery,
        highSoreness,
        flagsActive
    };
}

export interface CaloriesSignalResult {
    targetCalories: number;
    explanation?: string;
}

/**
 * Calculates target calories and energy burn adjustments based on session duration and target intensity.
 */
export function estimateCalorieBurn(timeLimit: string, intensity: number): CaloriesSignalResult {
    // Basic metabolic equivalent calculation
    let minutes = 45;
    if (timeLimit === "20 min") minutes = 20;
    else if (timeLimit === "30 min") minutes = 30;
    else if (timeLimit === "60 min") minutes = 60;

    // Estimate active calories burned: base rate + intensity factor
    const burnRate = 4 + (intensity / 100) * 8; // calories per minute
    const targetCalories = Math.round(minutes * burnRate);

    return {
        targetCalories,
        explanation: `Estimated active energy expenditure: ${targetCalories} kcal (based on ${minutes} min at ${intensity}% target intensity).`
    };
}

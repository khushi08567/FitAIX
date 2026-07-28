import { Exercise } from "./signals/equipment";

export interface WorkoutSession {
    title: string;
    description: string;
    exercises: Exercise[];
    intensity: number;
    recovery_score: number;
}

/**
 * Builds the workout session object, adjusting volume, sets, repetitions, and target intensity.
 */
export function buildWorkoutSession(
    exercises: Exercise[],
    goal: string,
    timeLimit: string,
    equipment: string,
    rules: { computedRecovery: number; lowRecovery: boolean; highSoreness: boolean; isReentry: boolean; injury: string }
): WorkoutSession {

    // 1. Map sets, reps, and rest details per exercise
    const result = exercises.map(ex => {
        let reps = "8-12 reps";
        let rest = "90s";

        if (goal === "Weight Loss") {
            reps = "12-15 reps";
            rest = "45s";
        } else if (goal === "Muscle Gain") {
            reps = "8-12 reps";
            rest = "90s";
        } else if (goal === "Strength") {
            reps = "4-6 reps";
            rest = "120s";
        } else { // Endurance
            reps = "15-20 reps";
            rest = "45s";
        }

        let sets = 3;
        if (goal === "Strength" && timeLimit === "60 min") {
            sets = 5;
        } else if (goal === "Muscle Gain" && ["45 min", "60 min"].includes(timeLimit)) {
            sets = 4;
        }

        let notes = ex.notes;

        if (rules.isReentry) {
            sets = 2;
            notes += " [Re-entry Phase: Focus on slow tempo and core bracing]";
        }

        if (rules.lowRecovery) {
            sets = Math.max(2, sets - 1);
            notes += " [Reduced Intensity: Lower weights, target RPE 6-7]";
        }

        if (rules.highSoreness) {
            notes += " [High Soreness: Increase rest time by 15s if needed]";
        }

        return {
            ...ex,
            sets,
            reps,
            rest,
            notes
        };
    });

    // 2. Set Session Title
    let title = `${goal} Session — ${equipment}`;
    if (rules.isReentry) {
        title = `Consistency Re-entry Protocol (${goal})`;
    } else if (rules.lowRecovery) {
        title = `Active Recovery ${goal} Routine`;
    }

    // 3. Calculate intensity rating percentage
    let intensity = 80;
    if (goal === "Strength") intensity = 90;
    else if (goal === "Muscle Gain") intensity = 85;
    else if (goal === "Weight Loss") intensity = 75;
    else intensity = 70;

    if (rules.lowRecovery) intensity -= 25;
    if (rules.isReentry) intensity = Math.min(intensity, 50);
    if (rules.highSoreness) intensity -= 10;
    if (rules.injury !== "None") intensity = Math.min(intensity, 65);

    intensity = Math.max(30, Math.min(100, intensity));

    return {
        title,
        description: `Custom ${goal.toLowerCase()} program optimized for a ${timeLimit} session using ${equipment.toLowerCase()} access.`,
        exercises: result,
        intensity,
        recovery_score: rules.computedRecovery
    };
}

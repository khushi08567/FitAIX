import { Exercise } from "./equipment";

export const INJURY_SUBSTITUTIONS: Record<string, Record<string, Partial<Exercise>>> = {
    "Knee": {
        "Barbell Squat": { name: "Leg Extensions (Light)", notes: "Controlled knee extensions, avoiding heavy squats." },
        "Goblet Squats": { name: "Single-Leg Glute Bridges", notes: "Glute focused hip extension. Safe for knee joint." },
        "Bodyweight Squats": { name: "Glute Bridges", notes: "No knee extension stress, hits posterior chain." },
        "Dumbbell Lunges": { name: "Lying Leg Curls (Light)", notes: "Substituted lunges to bypass knee flexion shear load." },
        "Bulgarian Split Squats": { name: "Glute Bridges", notes: "Protected knee joint, substituted split squat." }
    },
    "Shoulder": {
        "Barbell Bench Press": { name: "Pec Deck Chest Press", notes: "Horizontal adduction. Avoids rotator cuff extension strain." },
        "Pushups": { name: "Dumbbell Incline Flyes (Light)", notes: "Restricts shoulder internal rotation strain." },
        "Dumbbell Overhead Press": { name: "Dumbbell Lateral Raises (Light)", notes: "Avoids overhead lock out pain." },
        "Overhead Press": { name: "Cable Standing Flyes (Light)", notes: "Avoids overhead pressing mechanics entirely." },
        "Pike Pushups": { name: "Plank Hold", notes: "Static loading, removes dynamic shoulder impingement movement." }
    },
    "Lower Back": {
        "Deadlift": { name: "Lat Pulldowns", notes: "Replaced lumbar loading pull with vertical pull." },
        "Barbell Row": { name: "Chest-Supported Dumbbell Rows", notes: "Removes spinal shear load, support chest on bench." },
        "Banded Heavy Deadlifts": { name: "Banded Face Pulls", notes: "Targets upper back/shoulders, spares lumbar spine." },
        "Barbell Squat": { name: "Leg Press", notes: "Direct load on legs, spinal loading removed." }
    }
};

export interface InjurySubstitutionResult {
    substitutedExercises: Exercise[];
    injuryApplied: boolean;
    explanation?: {
        factor: string;
        observation: string;
        decision: string;
    };
}

/**
 * Replaces movements conflicting with joint/muscle pain reports with safe alternatives.
 */
export function applyInjurySubstitutions(exercises: Exercise[], injury: string, equipment: string): InjurySubstitutionResult {
    if (injury === "None" || !INJURY_SUBSTITUTIONS[injury]) {
        return { substitutedExercises: exercises, injuryApplied: false };
    }

    let injuryApplied = false;
    const subs = INJURY_SUBSTITUTIONS[injury];

    const result = exercises.map(ex => {
        const matchingSub = subs[ex.name];
        if (matchingSub) {
            injuryApplied = true;
            return {
                ...ex,
                name: matchingSub.name ?? ex.name,
                notes: matchingSub.notes ?? ex.notes
            };
        }
        return ex;
    });

    return {
        substitutedExercises: result,
        injuryApplied,
        explanation: injuryApplied ? {
            factor: "Injury Flag",
            observation: `Active ${injury} pain reported`,
            decision: `Joint stress conflict detected. Excluded heavy load exercises; substituted with ${injury}-safe alternatives.`
        } : undefined
    };
}

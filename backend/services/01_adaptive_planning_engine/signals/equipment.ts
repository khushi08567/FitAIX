export interface Exercise {
    name: string;
    notes: string;
    primary: string;
    sets?: number;
    reps?: string;
    rest?: string;
}

export const EXERCISES_POOL: Record<string, Record<string, Exercise[]>> = {
    "Gym": {
        "Weight Loss": [
            { name: "Kettlebell Swings", notes: "Hinge at hips, power from glutes, keep chest up.", primary: "lower_body" },
            { name: "Dumbbell Thrusters", notes: "Squat and press overhead in a single fluid motion.", primary: "full_body" },
            { name: "Lat Pulldowns", notes: "Keep chest up, drive elbows down to contract lat muscles.", primary: "upper_body" },
            { name: "Leg Press", notes: "Control descent. Keep feet flat. Do not lock knees.", primary: "legs_squat" },
            { name: "Hanging Knee Raises", notes: "Slow, controlled leg raises, engage lower abs.", primary: "core" },
            { name: "Rowing Machine", notes: "Maintain flat back, pull to lower ribs.", primary: "cardio" }
        ],
        "Muscle Gain": [
            { name: "Barbell Squat", notes: "Squat down to parallel. Drive up through heels.", primary: "legs_squat" },
            { name: "Barbell Bench Press", notes: "Control bar to mid-chest. Drive straight up.", primary: "upper_body_push" },
            { name: "Lat Pulldowns", notes: "Squeeze shoulder blades at peak contraction.", primary: "upper_body_pull" },
            { name: "Incline Dumbbell Flyes", notes: "Keep slight bend in elbows, stretch chest.", primary: "upper_body_push_acc" },
            { name: "Dumbbell Bicep Curls", notes: "Keep elbows fixed at sides, rotate wrist at top.", primary: "arms" },
            { name: "Tricep Pushdowns", notes: "Full lock out, focus on squeeze of tricep.", primary: "arms" }
        ],
        "Strength": [
            { name: "Barbell Squat", notes: "Brace core heavily. Explode from bottom.", primary: "legs_squat" },
            { name: "Barbell Bench Press", notes: "Drive feet into floor. Maintain tight arch.", primary: "upper_body_push" },
            { name: "Deadlift", notes: "Pull bar tight to shins. Drive hips forward.", primary: "legs_hinge" },
            { name: "Overhead Press", notes: "Press bar straight up. Squeeze glutes.", primary: "upper_body_push" },
            { name: "Weighted Pull-Ups", notes: "Full chest-to-bar. Retract scapula.", primary: "upper_body_pull" },
            { name: "Farmer's Walks", notes: "Heavy load, fast steps, rigid posture.", primary: "grip_core" }
        ],
        "Endurance": [
            { name: "Leg Press", notes: "Keep constant tension, moderate tempo.", primary: "legs_squat" },
            { name: "Lat Pulldowns", notes: "Higher reps, focus on contraction.", primary: "upper_body_pull" },
            { name: "Dumbbell Bench Press", notes: "Light weight, high reps, control movement.", primary: "upper_body_push" },
            { name: "Rowing Machine Sprint", notes: "Maintain high stroke rate, steady breathing.", primary: "cardio" },
            { name: "Kettlebell Goblet Squats", notes: "Keep core engaged, steady deep breaths.", primary: "legs_squat" },
            { name: "Plank Hold", notes: "Keep body straight, engage lower abs.", primary: "core" }
        ]
    },
    "Home": {
        "Weight Loss": [
            { name: "Dumbbell Thrusters", notes: "Explosive movement, using light dumbbells.", primary: "full_body" },
            { name: "Banded Rows", notes: "Squeeze mid-back, control return.", primary: "upper_body_pull" },
            { name: "Goblet Squats", notes: "Hold weight at chest, steady tempo.", primary: "legs_squat" },
            { name: "Mountain Climbers", notes: "Rapid knee drive, keep hips flat.", primary: "cardio_core" },
            { name: "Bicycle Crunches", notes: "Twist torso, touch opposite elbow to knee.", primary: "core" }
        ],
        "Muscle Gain": [
            { name: "Pushups", notes: "Maintain straight spine. Full chest range.", primary: "upper_body_push" },
            { name: "Banded Rows", notes: "Hold squeeze for 1 second at peak.", primary: "upper_body_pull" },
            { name: "Goblet Squats", notes: "Slow eccentric (3 seconds down) for hypertrophy.", primary: "legs_squat" },
            { name: "Dumbbell Lateral Raises", notes: "Keep palms down, lead with elbows.", primary: "upper_body_push_acc" },
            { name: "Dumbbell Floor Press", notes: "Focus on driving chest contraction from floor.", primary: "upper_body_push" },
            { name: "Dumbbell Bicep Curls", notes: "Strict form, no body swing.", primary: "arms" }
        ],
        "Strength": [
            { name: "Goblet Squats", notes: "Use heaviest dumbbell. Max contraction.", primary: "legs_squat" },
            { name: "Pushups (Weighted)", notes: "Place backpack with books on back.", primary: "upper_body_push" },
            { name: "Single-Arm Dumbbell Row", notes: "Heavy pull, brace other hand on chair.", primary: "upper_body_pull" },
            { name: "Dumbbell Overhead Press", notes: "Brace core, press strict.", primary: "upper_body_push" },
            { name: "Banded Romanian Deadlifts", notes: "Heavy band resistance, focus on hamstrings/glutes.", primary: "legs_hinge" }
        ],
        "Endurance": [
            { name: "Bodyweight Squats", notes: "Paced squats, high repetition count.", primary: "legs_squat" },
            { name: "Pushups", notes: "Maintain continuous movement tension.", primary: "upper_body_push" },
            { name: "Banded Rows", notes: "Fast pulling tempo, high reps.", primary: "upper_body_pull" },
            { name: "Jumping Jacks", notes: "Light on feet, maintain breathing pace.", primary: "cardio" },
            { name: "Plank Hold", notes: "Lock core, hold structure.", primary: "core" }
        ]
    },
    "Travel-No Equipment": {
        "Weight Loss": [
            { name: "Burpees", notes: "Full pushup to vertical jump. Explosive.", primary: "full_body" },
            { name: "Bodyweight Squats", notes: "Speed squats. Keep torso upright.", primary: "legs_squat" },
            { name: "Mountain Climbers", notes: "Keep shoulders over hands, rapid pace.", primary: "cardio_core" },
            { name: "Plank Jacks", notes: "Kick legs wide and back together in plank.", primary: "cardio_core" },
            { name: "Bicycle Crunches", notes: "Tuck elbow to knee, slow contractions.", primary: "core" }
        ],
        "Muscle Gain": [
            { name: "Pushups", notes: "Control tempo. Focus on chest/triceps.", primary: "upper_body_push" },
            { name: "Pike Pushups", notes: "Elevate hips, press downward to target shoulders.", primary: "upper_body_push_acc" },
            { name: "Bulgarian Split Squats", notes: "Elevate rear foot on bed or chair.", primary: "legs_squat" },
            { name: "Glute Bridges", notes: "Squeeze glutes at top, 1-sec hold.", primary: "legs_hinge" },
            { name: "Plank-to-Pushups", notes: "Up-downs. Core tight, alternate lead arm.", primary: "upper_body_push" },
            { name: "Doorframe Pull-ins", notes: "Hold frame, pull chest forward to engage lats.", primary: "upper_body_pull" }
        ],
        "Strength": [
            { name: "Decline Pushups", notes: "Elevate feet on bed/chair for higher resistance.", primary: "upper_body_push" },
            { name: "Bulgarian Split Squats", notes: "Very slow descent (4s) to maximize load.", primary: "legs_squat" },
            { name: "Single-Leg Glute Bridges", notes: "Drive through heel, brace lower back.", primary: "legs_hinge" },
            { name: "Pike Pushups", notes: "Keep body at 90-degree bend, press slow.", primary: "upper_body_push_acc" },
            { name: "Bodyweight Squat Jumps", notes: "Jump high, land soft. Explosive power.", primary: "legs_squat" }
        ],
        "Endurance": [
            { name: "Bodyweight Squats", notes: "Paced reps, keep moving.", primary: "legs_squat" },
            { name: "Pushups", notes: "Break into subsets if needed, maximize volume.", primary: "upper_body_push" },
            { name: "Mountain Climbers", notes: "Run knees in high tempo.", primary: "cardio_core" },
            { name: "Glute Bridges", notes: "Burn out hamstrings/glutes, high rep.", primary: "legs_hinge" },
            { name: "Plank Hold", notes: "Hold static position, keep breathing.", primary: "core" }
        ]
    }
};

/**
 * Returns the base exercise pool for the specified equipment and goal.
 */
export function getBasePool(equipment: string, goal: string): Exercise[] {
    const equipPool = EXERCISES_POOL[equipment];
    if (!equipPool) return [];
    return equipPool[goal] || [];
}

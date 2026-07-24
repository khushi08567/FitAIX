export const usersDatabase = {
  "Sarah Jenkins": {
    goal: "Marathon Preparation & Core Strength",
    activeGoalName: "Marathon Preparation",
    recovery: 82,
    injuredArea: "knee",
    injuredLaterality: "left",
    entries: [
      {
        id: "sarah-mem-01",
        userId: "sarah-jenkins",
        timestamp: "2026-07-15T11:30:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Sunday Workload Shift Rule",
        details: {
          pattern: "Sunday sleep drop detected",
          actionTaken: "Proactively moves heavy leg volume away from Mondays due to poor Sunday sleep patterns."
        },
        source: "AI",
        confidence: 0.92,
        visibility: "used-for-planning",
        tags: ["sleep-adjust", "schedule-shift"]
      },
      {
        id: "sarah-mem-02",
        userId: "sarah-jenkins",
        timestamp: "2026-07-14T04:00:00Z",
        type: "CONSTRAINT_CHANGED",
        summary: "Sleep Deprivation (Sunday Night Stress)",
        details: {
          sleepDurationHrs: 4.5,
          stressLevel: "high",
          cause: "Project launch preparation workloads",
          severity: "HIGH",
          status: "resolved"
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["sleep-deprivation", "stress"]
      },
      {
        id: "sarah-mem-03",
        userId: "sarah-jenkins",
        timestamp: "2026-07-11T14:30:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Switched Focus to Low-Impact Mobility",
        details: {
          originalActivity: "Road running",
          replacementActivity: "Swimming and elliptical mobility to allow knee tendon healing"
        },
        source: "AI",
        confidence: 0.88,
        visibility: "used-for-planning",
        tags: ["injury-safety", "low-impact"]
      },
      {
        id: "sarah-mem-04",
        userId: "sarah-jenkins",
        timestamp: "2026-07-09T18:15:00Z",
        type: "INJURY_REPORTED",
        summary: "Mild Left Knee Tendonitis (Running strain)",
        details: {
          affectedArea: "knee",
          laterality: "left",
          symptom: "Mild inflammation and stiffness during trail runs",
          severity: "MEDIUM",
          status: "active",
          restrictedMovements: ["high-impact-running", "heavy-squats"]
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["injury", "left-knee", "tendonitis"]
      },
      {
        id: "sarah-mem-04b",
        userId: "sarah-jenkins",
        timestamp: "2026-06-28T09:00:00Z",
        type: "INJURY_REPORTED",
        summary: "Left Ankle Sprain (Resolved)",
        details: {
          affectedArea: "ankle",
          laterality: "left",
          symptom: "Inversion strain during trail run",
          severity: "HIGH",
          status: "resolved",
          resolvedAt: "2026-07-05T12:00:00Z"
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["injury-resolved", "ankle-sprain"]
      },
      {
        id: "sarah-mem-05",
        userId: "sarah-jenkins",
        timestamp: "2026-07-06T08:30:00Z",
        type: "MILESTONE_ACHIEVED",
        summary: "Completed 15k Tempo Run Milestone",
        details: {
          distanceKm: 15,
          pace: "4:55/km",
          cardioRecoveryIndex: "excellent"
        },
        source: "inferred",
        confidence: 0.95,
        visibility: "used-for-planning",
        tags: ["milestone", "tempo-run"]
      },
      {
        id: "sarah-mem-06",
        userId: "sarah-jenkins",
        timestamp: "2026-07-02T10:00:00Z",
        type: "CONSTRAINT_CHANGED",
        summary: "Business Travel (No gym access)",
        details: {
          location: "Chicago",
          restriction: "hotel-only-workouts",
          severity: "LOW",
          status: "resolved"
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["travel", "hotel-workout", "constraint"]
      },
      {
        id: "sarah-mem-07",
        userId: "sarah-jenkins",
        timestamp: "2026-07-08T14:00:00Z",
        type: "HABIT_PATTERN_DETECTED",
        summary: "Friday evening workout dropout trend",
        details: {
          pattern: "Missed Friday evening run 3 weeks in a row",
          recommendation: "Move Friday cardio run to Saturday morning"
        },
        source: "AI",
        confidence: 0.90,
        visibility: "used-for-planning",
        tags: ["habit", "friday-skip", "cardio-pattern"]
      }
    ],
    scores: [
      { id: "score-workouts", name: "Workout Adherence", value: 88, basis: ["sarah-mem-01", "sarah-mem-05"], trend: "improving" },
      { id: "score-recovery", name: "Recovery Score", value: 82, basis: ["sarah-mem-02"], trend: "stable" },
      { id: "score-injury", name: "Injury Risk", value: 45, basis: ["sarah-mem-04"], trend: "watch" },
      { id: "score-progress", name: "Goal Progress", value: 68, basis: ["sarah-mem-05"], trend: "improving" },
      { id: "score-habit", name: "Habit Consistency", value: 85, basis: ["sarah-mem-01"], trend: "improving" },
      { id: "score-streak", name: "Streak Protection", value: 92, basis: ["sarah-mem-02"], trend: "stable" }
    ],
    explanationNotes: {
      "score-workouts": { heading: "Workout Adherence: 88%", explanation: "Consistent cardio adherence despite slight modifications for left knee strain.", trendText: "Improving (+2% this week)" },
      "score-recovery": { heading: "Recovery Score: 82%", explanation: "Adequate recovery. Short sleep duration offset by high base heart-rate variability.", trendText: "Stable (averaging 80%)" },
      "score-injury": { heading: "Injury Risk: 45%", explanation: "Watch status active. Left knee tendonitis requires low-impact swaps to prevent progression.", trendText: "Watch (running stress)" },
      "score-progress": { heading: "Goal Progress: 68%", explanation: "Ahead of baseline targets. Tempo run milestone locked in with good cardio indexing.", trendText: "Improving marathon readiness" },
      "score-habit": { heading: "Habit Consistency: 85%", explanation: "Strong adherence to sleep window adjustments and Thursday shifts.", trendText: "Improving" },
      "score-streak": { heading: "Streak Protection: 92%", explanation: "Active streak protection utilized twice to adjust running mileage during stress weeks.", trendText: "Stable" }
    },
    recoveryHistory: [
      { date: "Jul 10", recovery: 85, load: 70 },
      { date: "Jul 11", recovery: 78, load: 82 },
      { date: "Jul 12", recovery: 80, load: 65 },
      { date: "Jul 13", recovery: 72, load: 90 },
      { date: "Jul 14", recovery: 48, load: 40, label: "Sunday Night Stress" },
      { date: "Jul 15", recovery: 82, load: 60 }
    ],
    consistencyData: [
      { name: "Mon", rate: 85 },
      { name: "Tue", rate: 90 },
      { name: "Wed", rate: 75 },
      { name: "Thu", rate: 95 },
      { name: "Fri", rate: 40 },
      { name: "Sat", rate: 88 },
      { name: "Sun", rate: 60 }
    ]
  },
  "Marcus Chen": {
    goal: "Powerlifting Max Strength",
    activeGoalName: "Powerlifting: Squat/Bench/Deadlift Focus",
    recovery: 74,
    injuredArea: "wrist",
    injuredLaterality: "right",
    entries: [
      {
        id: "marcus-mem-01",
        userId: "marcus-chen",
        timestamp: "2026-07-19T17:30:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Substituted Bench Press with Floor Press",
        details: {
          pattern: "Anterior shoulder overload",
          actionTaken: "Bypassed chest-fly exercises to avoid excess anterior shoulder strain. Implemented board press variations."
        },
        source: "AI",
        confidence: 0.94,
        visibility: "used-for-planning",
        tags: ["bench-press", "shoulder-save"]
      },
      {
        id: "marcus-mem-02",
        userId: "marcus-chen",
        timestamp: "2026-07-17T14:15:00Z",
        type: "INJURY_REPORTED",
        summary: "Right Wrist Strain (heavy bench loading)",
        details: {
          affectedArea: "wrist",
          laterality: "right",
          symptom: "Mild pain during lockout phases",
          severity: "medium",
          status: "active",
          restrictedMovements: ["heavy-straight-barbell-bench", "overhead-press"]
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["injury", "right-wrist", "strain"]
      },
      {
        id: "marcus-mem-03",
        userId: "marcus-chen",
        timestamp: "2026-07-14T10:00:00Z",
        type: "MILESTONE_ACHIEVED",
        summary: "Achieved 200kg Deadlift PR",
        details: {
          metric: "Deadlift 1RM",
          value: "200kg",
          formFeedback: "Lockout form validated via bar-path tracking. 1.0 confidence on optimal hip extension."
        },
        source: "inferred",
        confidence: 0.96,
        visibility: "used-for-planning",
        tags: ["milestone", "deadlift-pr"]
      }
    ],
    scores: [
      { id: "score-workouts", name: "Workout Adherence", value: 92, basis: ["marcus-mem-01", "marcus-mem-03"], trend: "improving" },
      { id: "score-recovery", name: "Recovery Score", value: 74, basis: ["marcus-mem-02"], trend: "watch" },
      { id: "score-injury", name: "Injury Risk", value: 58, basis: ["marcus-mem-02"], trend: "watch" },
      { id: "score-progress", name: "Goal Progress", value: 80, basis: ["marcus-mem-03"], trend: "improving" },
      { id: "score-habit", name: "Habit Consistency", value: 78, basis: ["marcus-mem-01"], trend: "stable" },
      { id: "score-streak", name: "Streak Protection", value: 95, basis: ["marcus-mem-03"], trend: "stable" }
    ],
    explanationNotes: {
      "score-workouts": { heading: "Workout Adherence: 92%", explanation: "Extremely high lifting consistency. Minor switches to block bench to offload strain.", trendText: "Improving (+3% this week)" },
      "score-recovery": { heading: "Recovery Score: 74%", explanation: "Slightly low recovery due to neural fatigue from heavy 1RM deadlifts.", trendText: "Watch status" },
      "score-injury": { heading: "Injury Risk: 58%", explanation: "Watch status active. Right wrist tendon strain needs wrist-wrap loading restrictions.", trendText: "Watch (wrist strain)" },
      "score-progress": { heading: "Goal Progress: 80%", explanation: "PR deadlift reached ahead of scheduling guidelines.", trendText: "Improving power goals" },
      "score-habit": { heading: "Habit Consistency: 78%", explanation: "Stable sleep schedule, nutrition window needs tighter pacing.", trendText: "Stable" },
      "score-streak": { heading: "Streak Protection: 95%", explanation: "No streak protective buffers spent. Consistency remains perfect.", trendText: "Stable" }
    },
    recoveryHistory: [
      { date: "Jul 10", recovery: 80, load: 85 },
      { date: "Jul 11", recovery: 82, load: 90 },
      { date: "Jul 12", recovery: 75, load: 88 },
      { date: "Jul 13", recovery: 70, load: 95 },
      { date: "Jul 14", recovery: 85, load: 100, label: "Deadlift PR" },
      { date: "Jul 15", recovery: 74, load: 50 }
    ],
    consistencyData: [
      { name: "Mon", rate: 95 },
      { name: "Tue", rate: 92 },
      { name: "Wed", rate: 85 },
      { name: "Thu", rate: 90 },
      { name: "Fri", rate: 95 },
      { name: "Sat", rate: 70 },
      { name: "Sun", rate: 50 }
    ]
  },
  "Elena Rostova": {
    goal: "Fat Loss & Endurance",
    activeGoalName: "Caloric Management & Core Stability",
    recovery: 78,
    injuredArea: "none",
    injuredLaterality: "none",
    entries: [
      {
        id: "elena-mem-01",
        userId: "elena-rostova",
        timestamp: "2026-07-18T21:15:00Z",
        type: "HABIT_PATTERN_DETECTED",
        summary: "Late Evening Meal Pattern Detected",
        details: {
          pattern: "Caloric intake shifted past 9 PM.",
          actionTaken: "Recommendation: advance afternoon protein snack by 2 hours to limit nighttime cravings."
        },
        source: "inferred",
        confidence: 0.90,
        visibility: "used-for-planning",
        tags: ["nutrition", "snack-shift"]
      },
      {
        id: "elena-mem-02",
        userId: "elena-rostova",
        timestamp: "2026-07-15T07:00:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Bypassed HIIT Circuit due to Fatigue",
        details: {
          fatigueScore: "high",
          actionTaken: "Switched high-intensity intervals to 45 mins LISS zone-2 recovery walk."
        },
        source: "AI",
        confidence: 0.95,
        visibility: "used-for-planning",
        tags: ["hiit-skip", "liss-swap"]
      },
      {
        id: "elena-mem-03",
        userId: "elena-rostova",
        timestamp: "2026-07-12T08:30:00Z",
        type: "MILESTONE_ACHIEVED",
        summary: "Steady Fat Loss Trend (-1.2kg)",
        details: {
          weighInKg: 64.8,
          weeklyCalorieDeficit: 3500
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["milestone", "weight-loss"]
      },
      {
        id: "elena-mem-04",
        userId: "elena-rostova",
        timestamp: "2026-07-05T09:00:00Z",
        type: "GOAL_CHANGED",
        summary: "Goal Switch: Weight Loss to Muscle Gain",
        details: {
          previousGoal: "Fat Loss & Endurance",
          newGoal: "Upper Body Hypertrophy & Muscle Gain",
          reason: "Target weight of 65kg achieved. Moving to lean bulk and strength retention phase."
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["goal-change", "muscle-gain"]
      },
      {
        id: "elena-mem-05",
        userId: "elena-rostova",
        timestamp: "2026-07-07T16:00:00Z",
        type: "PREFERENCE_LEARNED",
        summary: "Prefers evening training sessions",
        details: {
          preferenceType: "session-time",
          preferredTime: "18:00 - 20:00",
          basis: "HRV recovery indices and training velocity show a 12% improvement in evening lifts compared to mornings."
        },
        source: "inferred",
        confidence: 0.89,
        visibility: "used-for-planning",
        tags: ["preference", "evening-session"]
      }
    ],
    scores: [
      { id: "score-workouts", name: "Workout Adherence", value: 85, basis: ["elena-mem-02"], trend: "stable" },
      { id: "score-recovery", name: "Recovery Score", value: 78, basis: ["elena-mem-02"], trend: "improving" },
      { id: "score-injury", name: "Injury Risk", value: 20, basis: [], trend: "improving" },
      { id: "score-progress", name: "Goal Progress", value: 75, basis: ["elena-mem-03"], trend: "improving" },
      { id: "score-habit", name: "Habit Consistency", value: 82, basis: ["elena-mem-01"], trend: "watch" },
      { id: "score-streak", name: "Streak Protection", value: 90, basis: [], trend: "stable" }
    ],
    explanationNotes: {
      "score-workouts": { heading: "Workout Adherence: 85%", explanation: "Good adherence. Recovery LISS walks integrated to maintain cardio output during high fatigue.", trendText: "Stable" },
      "score-recovery": { heading: "Recovery Score: 78%", explanation: "Recovering well from deficit fatigue. Sleep patterns remain stable.", trendText: "Improving" },
      "score-injury": { heading: "Injury Risk: 20%", explanation: "Very low risk. No muscle strains or joint constraints detected.", trendText: "Safe status" },
      "score-progress": { heading: "Goal Progress: 75%", explanation: "On track. Deficit targets met over 14 days with structured scaling.", trendText: "Improving fat loss rate" },
      "score-habit": { heading: "Habit Consistency: 82%", explanation: "Evening caloric intake spikes monitored closely to ensure recovery windows are clear.", trendText: "Watch status" },
      "score-streak": { heading: "Streak Protection: 90%", explanation: "Active streak protection intact.", trendText: "Stable" }
    },
    recoveryHistory: [
      { date: "Jul 10", recovery: 70, load: 80 },
      { date: "Jul 11", recovery: 74, load: 75 },
      { date: "Jul 12", recovery: 78, load: 60 },
      { date: "Jul 13", recovery: 72, load: 85 },
      { date: "Jul 14", recovery: 65, load: 90 },
      { date: "Jul 15", recovery: 78, load: 45, label: "HIIT Bypassed" }
    ],
    consistencyData: [
      { name: "Mon", rate: 80 },
      { name: "Tue", rate: 85 },
      { name: "Wed", rate: 70 },
      { name: "Thu", rate: 90 },
      { name: "Fri", rate: 88 },
      { name: "Sat", rate: 85 },
      { name: "Sun", rate: 90 }
    ]
  },
  "David Kim": {
    goal: "General Health & Knee Mobility",
    activeGoalName: "Lower Extremity Flexion Stability",
    recovery: 88,
    injuredArea: "knee",
    injuredLaterality: "left",
    entries: [
      {
        id: "david-mem-01",
        userId: "david-kim",
        timestamp: "2026-07-20T18:00:00Z",
        type: "MILESTONE_ACHIEVED",
        summary: "Knee mobility exercises complete",
        details: {
          isometricExtensions: "3 sets",
          hamstringStretches: "3 sets",
          compliance: "100%"
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["rehab", "mobility"]
      },
      {
        id: "david-mem-02",
        userId: "david-kim",
        timestamp: "2026-07-16T09:30:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Bypassed heavy squats due to knee swelling",
        details: {
          symptom: "knee swelling",
          actionTaken: "Replaced barbell back squats with goblet squats and leg press."
        },
        source: "AI",
        confidence: 0.98,
        visibility: "used-for-planning",
        tags: ["safety", "squat-bypass"]
      },
      {
        id: "david-mem-03",
        userId: "david-kim",
        timestamp: "2026-07-14T16:30:00Z",
        type: "INJURY_REPORTED",
        summary: "Left Knee Sprain (flare up)",
        details: {
          affectedArea: "knee",
          laterality: "left",
          symptom: "Swelling and weight-bearing soreness",
          severity: "high",
          status: "active",
          restrictedMovements: ["heavy-back-squats", "running"]
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["injury", "left-knee", "sprain"]
      }
    ],
    scores: [
      { id: "score-workouts", name: "Workout Adherence", value: 86, basis: ["david-mem-01", "david-mem-02"], trend: "improving" },
      { id: "score-recovery", name: "Recovery Score", value: 88, basis: ["david-mem-01"], trend: "improving" },
      { id: "score-injury", name: "Injury Risk", value: 65, basis: ["david-mem-03"], trend: "watch" },
      { id: "score-progress", name: "Goal Progress", value: 48, basis: ["david-mem-02"], trend: "stable" },
      { id: "score-habit", name: "Habit Consistency", value: 82, basis: ["david-mem-01"], trend: "improving" },
      { id: "score-streak", name: "Streak Protection", value: 90, basis: [], trend: "stable" }
    ],
    explanationNotes: {
      "score-workouts": { heading: "Workout Adherence: 86%", explanation: "Consistently hit mobility adjustments. Heavy axial loads bypassed.", trendText: "Improving (+1% this week)" },
      "score-recovery": { heading: "Recovery Score: 88%", explanation: "Inflammation levels dropping. Heart rate variability indicating strong parasympathetic state.", trendText: "Improving" },
      "score-injury": { heading: "Injury Risk: 65%", explanation: "Watch status active. Ankle/knee limits restricted. Rehab metrics look solid.", trendText: "Watch (left knee strain)" },
      "score-progress": { heading: "Goal Progress: 48%", explanation: "Slow mobility progress, knee pain limits training capacity on leg days.", trendText: "Stable rehab phase" },
      "score-habit": { heading: "Habit Consistency: 82%", explanation: "Isometric exercise habit is fully established.", trendText: "Improving" },
      "score-streak": { heading: "Streak Protection: 90%", explanation: "Streak preserved via mobility homework.", trendText: "Stable" }
    },
    recoveryHistory: [
      { date: "Jul 10", recovery: 82, load: 50 },
      { date: "Jul 11", recovery: 85, load: 45 },
      { date: "Jul 12", recovery: 88, load: 40 },
      { date: "Jul 13", recovery: 90, load: 30 },
      { date: "Jul 14", recovery: 60, load: 70, label: "Knee Flare Up" },
      { date: "Jul 15", recovery: 88, load: 35 }
    ],
    consistencyData: [
      { name: "Mon", rate: 90 },
      { name: "Tue", rate: 80 },
      { name: "Wed", rate: 85 },
      { name: "Thu", rate: 82 },
      { name: "Fri", rate: 90 },
      { name: "Sat", rate: 80 },
      { name: "Sun", rate: 85 }
    ]
  },
  "Aisha Bello": {
    goal: "Upper Body Hypertrophy & Muscle Gain",
    activeGoalName: "Shoulder Stability & Progression",
    recovery: 85,
    injuredArea: "elbow",
    injuredLaterality: "right",
    entries: [
      {
        id: "aisha-mem-01",
        userId: "aisha-bello",
        timestamp: "2026-07-19T20:00:00Z",
        type: "MILESTONE_ACHIEVED",
        summary: "Increased Pull-Up Volume (+5 reps)",
        details: {
          pullUpSets: "3 sets of 12 reps",
          strengthProgression: "positive"
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["strength-gain", "pull-ups"]
      },
      {
        id: "aisha-mem-02",
        userId: "aisha-bello",
        timestamp: "2026-07-16T11:00:00Z",
        type: "INJURY_REPORTED",
        summary: "Right Elbow Tendonitis (Pull strain)",
        details: {
          affectedArea: "elbow",
          laterality: "right",
          symptom: "Clicking and elbow fatigue",
          severity: "low",
          status: "active",
          restrictedMovements: ["heavy-dumbbell-curls", "pronated-grip-pulls"]
        },
        source: "user",
        confidence: 1.0,
        visibility: "used-for-planning",
        tags: ["injury", "right-elbow", "tendonitis"]
      },
      {
        id: "aisha-mem-03",
        userId: "aisha-bello",
        timestamp: "2026-07-13T15:00:00Z",
        type: "PLAN_ADJUSTMENT_REASON",
        summary: "Substituted Barbell Rows with Chest-Supported Rows",
        details: {
          lumbarLoading: "lowered",
          actionTaken: "Bypassed low-back lumbar loading by shifting row variation to chest-supported bench."
        },
        source: "AI",
        confidence: 0.95,
        visibility: "used-for-planning",
        tags: ["adaptation", "back-support"]
      }
    ],
    scores: [
      { id: "score-workouts", name: "Workout Adherence", value: 89, basis: ["aisha-mem-01", "aisha-mem-03"], trend: "improving" },
      { id: "score-recovery", name: "Recovery Score", value: 85, basis: ["aisha-mem-01"], trend: "stable" },
      { id: "score-injury", name: "Injury Risk", value: 35, basis: ["aisha-mem-02"], trend: "watch" },
      { id: "score-progress", name: "Goal Progress", value: 72, basis: ["aisha-mem-01"], trend: "improving" },
      { id: "score-habit", name: "Habit Consistency", value: 80, basis: ["aisha-mem-03"], trend: "stable" },
      { id: "score-streak", name: "Streak Protection", value: 92, basis: [], trend: "stable" }
    ],
    explanationNotes: {
      "score-workouts": { heading: "Workout Adherence: 89%", explanation: "Excellent volume compliance. Pulled back barbell rows to protect low back loading parameters.", trendText: "Improving (+2% this week)" },
      "score-recovery": { heading: "Recovery Score: 85%", explanation: "Consistent recovery metrics, sleep duration matches baseline requirements.", trendText: "Stable" },
      "score-injury": { heading: "Injury Risk: 35%", explanation: "Watch status active. Right elbow tendon strain needs load limitations.", trendText: "Watch (elbow clicking)" },
      "score-progress": { heading: "Goal Progress: 72%", explanation: "Ahead of volume calculations due to progressive loading targets.", trendText: "Improving hypertrophy goals" },
      "score-habit": { heading: "Habit Consistency: 80%", explanation: "Good water and recovery stretch compliance.", trendText: "Stable" },
      "score-streak": { heading: "Streak Protection: 92%", explanation: "Streak records are stable and active.", trendText: "Stable" }
    },
    recoveryHistory: [
      { date: "Jul 10", recovery: 85, load: 75 },
      { date: "Jul 11", recovery: 88, load: 80 },
      { date: "Jul 12", recovery: 90, load: 85 },
      { date: "Jul 13", recovery: 85, load: 90 },
      { date: "Jul 14", recovery: 82, load: 60, label: "Elbow Click" },
      { date: "Jul 15", recovery: 85, load: 70 }
    ],
    consistencyData: [
      { name: "Mon", rate: 90 },
      { name: "Tue", rate: 88 },
      { name: "Wed", rate: 85 },
      { name: "Thu", rate: 95 },
      { name: "Fri", rate: 90 },
      { name: "Sat", rate: 60 },
      { name: "Sun", rate: 50 }
    ]
  }
};

// Default export values mapping to Sarah Jenkins for initial loads
export const initialEntries = usersDatabase["Sarah Jenkins"].entries;
export const initialDerivedScores = usersDatabase["Sarah Jenkins"].scores;
export const nodeExplanationNotes = usersDatabase["Sarah Jenkins"].explanationNotes;
export const initialRecoveryHistory = usersDatabase["Sarah Jenkins"].recoveryHistory;
export const initialConsistencyData = usersDatabase["Sarah Jenkins"].consistencyData;

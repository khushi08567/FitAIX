import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },

  profile: {
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: Number,
    weight: Number,
    bodyFatPercentage: Number,
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'athlete'], default: 'intermediate' },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' }
  },

  healthProfile: {
    chronicConditions: [{
      condition: { type: String },
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      medications: [String],
      restrictions: [String],
      diagnosedDate: Date
    }],
    allergies: [String],
    bloodType: String
  },

  injuries: [{
    bodyPart: { type: String },
    type: { type: String },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    dateReported: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    restrictions: [String],
    expectedRecoveryDate: Date
  }],

  equipment: [String],

  preferences: {
    workoutDuration: { type: Number, default: 45 },
    workoutLocation: { type: String, enum: ['gym', 'home', 'outdoor', 'hotel'], default: 'gym' },
    dietType: { type: String, default: 'omnivore' },
    budget: { type: String, default: 'medium' },
    cookingSkill: { type: String, default: 'intermediate' },
    country: String,
    religion: String,
    cuisine: { type: String, default: 'any' },
    cuisinePerMeal: {
      breakfast: String, lunch: String, snack: String, dinner: String
    },
    dislikedExerciseNames: [String],
    cheatDays: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      type: { type: String, enum: ['full', 'workout_only', 'meal_only'], default: 'full' }
    }]
  },

  currentGoal: {
    type: { type: String, default: 'muscle_gain' },
    targetValue: Number,
    startValue: Number,
    unit: String,
    startDate: Date,
    deadline: Date
  },

  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastWorkoutDate: Date
  },

  gamification: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 1000 },
    rankTitle: { type: String, default: 'Novice Lifter' },
    archetype: {
      id: String, name: String, tagline: String, icon: String, color: String,
      bonusStats: { strength: Number, endurance: Number, mobility: Number, consistency: Number, recovery: Number }
    },
    attributes: {
      strength: { type: Number, default: 10 },
      endurance: { type: Number, default: 10 },
      mobility: { type: Number, default: 10 },
      consistency: { type: Number, default: 5 },
      recovery: { type: Number, default: 10 }
    }
  },

  onboardingCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);

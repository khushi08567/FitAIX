import * as fs from 'fs';
import * as path from 'path';
import {
  dailyNutritionStore,
  bmiStore,
  strategyStore,
  preferencesStore,
  hydrationStore
} from '../models/nutrition.model';

const DATASET_PATH = path.join(__dirname, '..', 'models', 'users_dataset.json');

// Helper to read dataset
function readDataset(): any[] {
  try {
    if (!fs.existsSync(DATASET_PATH)) {
      fs.writeFileSync(DATASET_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATASET_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user dataset:', error);
    return [];
  }
}

// Helper to write dataset
function writeDataset(users: any[]): void {
  try {
    fs.writeFileSync(DATASET_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing user dataset:', error);
  }
}

export function registerUser(userData: any) {
  const users = readDataset();
  const existing = users.find(
    (u) => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  if (existing) {
    throw new Error('User already exists');
  }

  // Create clean user object
  const newUser = {
    userId: `user_${Date.now()}`,
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName || '',
    goal: userData.goal || 'Build muscle',
    gender: userData.gender || 'Prefer not to say',
    height: userData.height || '170cm',
    weight: userData.weight || '70kg',
    birthdate: userData.birthdate || '01/01/1990',
    experience: userData.experience || 'Beginner',
    motivation: userData.motivation || 'Self-Motivated',
    obstacle: userData.obstacle || 'None right now',
    source: userData.source || 'Search',
    workoutLocation: userData.workoutLocation || 'Gym',
    workoutExperience: userData.workoutExperience || 'Beginner',
    workoutDuration: userData.workoutDuration || '30 minutes',
    workoutFrequency: userData.workoutFrequency || '3 days',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeDataset(users);

  // Parse height (numeric)
  let heightNum = 170;
  if (userData.height) {
    const match = userData.height.match(/\d+/);
    if (match) heightNum = parseInt(match[0]);
  }
  // Parse weight (numeric)
  let weightNum = 70;
  if (userData.weight) {
    const match = userData.weight.match(/\d+/);
    if (match) weightNum = parseInt(match[0]);
  }

  // Seed default stores for this user id
  const today = new Date().toISOString().split('T')[0];
  dailyNutritionStore.set(newUser.userId, {
    userId: newUser.userId,
    date: today,
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    protein: { consumed: 0, goal: 150 },
    carbs: { consumed: 0, goal: 200 },
    fat: { consumed: 0, goal: 65 },
    fiber: { consumed: 0, goal: 30 },
  });

  bmiStore.set(newUser.userId, {
    userId: newUser.userId,
    weight: weightNum,
    height: heightNum,
    bmi: parseFloat((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1)),
    category: 'Normal',
    healthyRange: { min: 18.5, max: 24.9 },
    aiSuggestion: 'Build lean muscle to support active goals.',
    updatedAt: new Date().toISOString(),
  });

  strategyStore.set(newUser.userId, {
    userId: newUser.userId,
    targetCalories: 2000,
    proteinGoal: 150,
    hydrationGoal: 2500,
    weeklyGoal: newUser.goal,
    aiExplanation: 'Personalized caloric split based on onboarding details.',
    generatedAt: new Date().toISOString(),
  });

  preferencesStore.set(newUser.userId, {
    userId: newUser.userId,
    dietaryPreferences: [],
    allergies: [],
    favoriteFoods: [],
    updatedAt: new Date().toISOString(),
  });

  hydrationStore.set(newUser.userId, {
    userId: newUser.userId,
    date: today,
    currentIntake: 0,
    goal: 2500,
    logs: [],
  });

  return newUser;
}

export function loginUser(credentials: any) {
  const users = readDataset();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === credentials.email.toLowerCase() &&
      u.password === credentials.password
  );
  if (!user) {
    throw new Error('Invalid email or password');
  }
  return user;
}

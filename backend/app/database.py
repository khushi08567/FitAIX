import os
import json
import logging
import requests
from typing import Dict, Any, List

# Configure logger
logger = logging.getLogger("fitaix.database")

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_FILE = os.path.join(BASE_DIR, "user_profile.json")

# Express Backend Service details
EXPRESS_BASE_URL = "http://localhost:4001/api/v1"
DEFAULT_USER = "user_001"

# Default User Profile for Simran (matching Notion Requirements & chatbot examples)
DEFAULT_PROFILE = {
    "name": "Simran",
    "age": 25,
    "height_cm": 168,
    "weight_kg": 60,
    "goal": "Muscle Gain & Injury Recovery",
    "today_workout_focus": "Legs",
    "sleep_hours": 7.75,
    "recovery_score": 82,
    "calories_limit": 2000,
    "calories_consumed": 0,
    "protein_target_g": 120,
    "protein_consumed_g": 0,
    "carbs_consumed_g": 0,
    "fat_consumed_g": 0,
    "hydration_target_ml": 2500,
    "hydration_consumed_ml": 0,
    "injuries": [
        "left knee patellar tendinitis (avoid deep squats or high-impact jumping)"
    ],
    "preferences": [
        "prefers dumbbell workouts",
        "vegetarian",
        "trains in the morning"
    ],
    "user_facts": [
        "Likes high-protein snacks post-workout",
        "Dislikes cottage cheese"
    ]
}

# Exercise Database (Workout Knowledge Engine)
EXERCISE_DB = {
    "dumbbell bench press": {
        "description": "Chest exercise using dumbbells on a flat bench. Safer for shoulders than barbell.",
        "form": "Keep elbows at 45-degree angle. Press straight up. Contract chest at the top.",
        "reps_sets": "3-4 sets of 8-12 reps",
        "alternatives": ["push-ups", "dumbbell floor press", "chest press machine"],
        "safety_notes": "Do not flare elbows to 90 degrees. Keep feet flat on floor."
    },
    "dumbbell goblet squat": {
        "description": "Squat variation holding a single dumbbell vertically at the chest.",
        "form": "Hold dumbbell close. Sit back and down. Keep chest up. Push knees outward.",
        "reps_sets": "3 sets of 10-15 reps",
        "alternatives": ["dumbbell leg press", "glute bridges", "romanian deadlifts"],
        "safety_notes": "Avoid deep knee flexion past 90 degrees if you have knee pain. Keep spine neutral."
    },
    "romanian deadlift": {
        "description": "Hip hinge exercise targeting hamstrings and glutes.",
        "form": "Slight bend in knees. Hinge at hips. Keep dumbbells close to legs. Squeeze glutes at top.",
        "reps_sets": "3 sets of 8-10 reps",
        "alternatives": ["lying leg curl", "glute bridges", "good mornings"],
        "safety_notes": "Do not round the lower back. Keep movement controlled."
    },
    "dumbbell shoulder press": {
        "description": "Vertical pressing exercise for anterior and lateral deltoids.",
        "form": "Sit upright. Press dumbbells from shoulder height overhead. Avoid arching lower back.",
        "reps_sets": "3 sets of 10-12 reps",
        "alternatives": ["dumbbell lateral raise", "pike pushups"],
        "safety_notes": "Ensure wrists stay directly stacked above elbows."
    },
    "glute bridge": {
        "description": "Glute isolation movement that puts zero stress on the knees or lower back.",
        "form": "Lie flat on back. Bend knees. Drive through heels to lift hips up. Squeeze glutes at top.",
        "reps_sets": "3-4 sets of 12-15 reps",
        "alternatives": ["single-leg glute bridge", "hip thrusts"],
        "safety_notes": "Excellent for knee injury recovery. Avoid over-arching lower back at the top."
    }
}

# Nutrition Database (Nutrition Knowledge Engine)
NUTRITION_DB = {
    "greek yogurt bowl": {
        "name": "High-Protein Greek Yogurt Bowl",
        "calories": 280,
        "protein_g": 24,
        "carbs_g": 30,
        "fats_g": 4,
        "ingredients": [
            "200g Non-fat Greek Yogurt",
            "1 medium Banana (sliced)",
            "15g Honey or Maple Syrup",
            "10g Chia Seeds"
        ],
        "instructions": [
            "Scoop yogurt into a bowl.",
            "Top with sliced banana, chia seeds, and drizzle honey.",
            "Mix and enjoy as a quick pre/post-workout snack."
        ]
    },
    "protein shake": {
        "name": "Whey/Plant Protein Recovery Shake",
        "calories": 210,
        "protein_g": 30,
        "carbs_g": 12,
        "fats_g": 3,
        "ingredients": [
            "1 scoop Whey or Soy Protein Isolate (chocolate or vanilla)",
            "250ml Soy Milk or Almond Milk",
            "100g Frozen Strawberries or Blueberries"
        ],
        "instructions": [
            "Add all ingredients to a blender.",
            "Blend on high for 30 seconds until smooth.",
            "Drink within 45 minutes of training."
        ]
    },
    "tofu scramble": {
        "name": "Savory Tofu & Spinach Scramble",
        "calories": 320,
        "protein_g": 22,
        "carbs_g": 15,
        "fats_g": 18,
        "ingredients": [
            "200g Firm Tofu (crumbled)",
            "1 cup fresh Spinach leaves",
            "1/2 medium Bell Pepper (diced)",
            "1 tbsp Olive Oil",
            "Spices: Turmeric, Salt, Black Pepper, Nutritional Yeast"
        ],
        "instructions": [
            "Heat olive oil in a skillet over medium heat.",
            "Add crumbled tofu, bell peppers, and spices. Sauté for 5 minutes.",
            "Stir in spinach until wilted. Serve immediately."
        ]
    }
}


def fetch_live_express_profile() -> Dict[str, Any]:
    """
    Queries the live Express Node.js backend to build the most up-to-date user context.
    Raises Exception if the Express server is offline.
    """
    # 1. Fetch Daily Calorie/Macro totals
    daily_url = f"{EXPRESS_BASE_URL}/nutrition/{DEFAULT_USER}/daily"
    daily_res = requests.get(daily_url, timeout=1.5)
    daily_res.raise_for_status()
    daily_data = daily_res.json()["data"]
    
    # 2. Fetch Hydration logs
    hyd_url = f"{EXPRESS_BASE_URL}/nutrition/{DEFAULT_USER}/hydration"
    hyd_res = requests.get(hyd_url, timeout=1.5)
    hyd_res.raise_for_status()
    hyd_data = hyd_res.json()["data"]
    
    # 3. Fetch Dietary Preferences & Allergies
    pref_url = f"{EXPRESS_BASE_URL}/nutrition/{DEFAULT_USER}/preferences"
    pref_res = requests.get(pref_url, timeout=1.5)
    pref_res.raise_for_status()
    pref_data = pref_res.json()["data"]

    # Assemble profile dict matching local agent context expectations
    live_profile = {
        "name": "Simran",
        "age": 25,
        "height_cm": 168,
        "weight_kg": 60,
        "goal": "Muscle Gain & Injury Recovery",
        "today_workout_focus": "Legs",
        "sleep_hours": 7.75,
        "recovery_score": 82,
        
        # Live values from Express server
        "calories_limit": daily_data.get("caloriesGoal", 2000),
        "calories_consumed": daily_data.get("caloriesConsumed", 0),
        "protein_target_g": daily_data.get("protein", {}).get("goal", 120),
        "protein_consumed_g": daily_data.get("protein", {}).get("consumed", 0),
        "carbs_consumed_g": daily_data.get("carbs", {}).get("consumed", 0),
        "fat_consumed_g": daily_data.get("fat", {}).get("consumed", 0),
        
        "hydration_target_ml": hyd_data.get("targetIntake", 2500),
        "hydration_consumed_ml": hyd_data.get("currentIntake", 0),
        
        "injuries": [
            "left knee patellar tendinitis (avoid deep squats or high-impact jumping)"
        ],
        "preferences": pref_data.get("dietaryPreferences", []),
        "allergies": pref_data.get("allergies", []),
        "user_facts": pref_data.get("favoriteFoods", [])
    }
    return live_profile


def load_user_profile() -> Dict[str, Any]:
    """Loads the user profile. Attempts to query the live Express server, otherwise falls back to local file."""
    try:
        live_profile = fetch_live_express_profile()
        # Cache locally in case Express server goes offline in the future
        save_user_profile(live_profile)
        return live_profile
    except Exception as e:
        logger.warning(f"Express nutrition server is offline, falling back to local file. Error: {e}")
        if not os.path.exists(PROFILE_FILE):
            save_user_profile(DEFAULT_PROFILE)
            return DEFAULT_PROFILE
        try:
            with open(PROFILE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_PROFILE


def save_user_profile(profile: Dict[str, Any]) -> None:
    """Saves the user profile to local disk."""
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)


def add_hydration_log(amount_ml: int) -> str:
    """Logs water intake on the Express server (falls back to local JSON if server is down)."""
    try:
        url = f"{EXPRESS_BASE_URL}/nutrition/hydration/add"
        res = requests.post(url, json={"userId": DEFAULT_USER, "amount": amount_ml}, timeout=1.5)
        res.raise_for_status()
        return f"Successfully logged {amount_ml}ml of water on the live server."
    except Exception as e:
        logger.error(f"Failed to write hydration to Express, caching locally: {e}")
        profile = load_user_profile()
        profile["hydration_consumed_ml"] = profile.get("hydration_consumed_ml", 0) + amount_ml
        save_user_profile(profile)
        return f"Logged {amount_ml}ml of water locally (Express server offline)."


def log_meal_entry(name: str, calories: int, protein: int, carbs: int, fat: int, meal_type: str = "snack") -> str:
    """Logs a meal entry on the Express server (falls back to local JSON if server is down)."""
    try:
        url = f"{EXPRESS_BASE_URL}/nutrition/meals/log"
        payload = {
            "userId": DEFAULT_USER,
            "mealType": meal_type,
            "name": name,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fat": fat
        }
        res = requests.post(url, json=payload, timeout=1.5)
        res.raise_for_status()
        return f"Successfully logged meal '{name}' ({calories} kcal) on the live server."
    except Exception as e:
        logger.error(f"Failed to write meal log to Express, caching locally: {e}")
        profile = load_user_profile()
        profile["calories_consumed"] = profile.get("calories_consumed", 0) + calories
        profile["protein_consumed_g"] = profile.get("protein_consumed_g", 0) + protein
        save_user_profile(profile)
        return f"Logged meal '{name}' ({calories} kcal) locally (Express server offline)."


def save_preferences_express(dietary_preferences: List[str], allergies: List[str], favorite_foods: List[str]) -> str:
    """Updates food preferences on the Express server (falls back to local JSON if server is down)."""
    try:
        url = f"{EXPRESS_BASE_URL}/nutrition/preferences"
        # First get existing to avoid overwriting them entirely
        existing_url = f"{EXPRESS_BASE_URL}/nutrition/{DEFAULT_USER}/preferences"
        existing_res = requests.get(existing_url, timeout=1.5)
        existing_data = existing_res.json()["data"] if existing_res.status_code == 200 else {}
        
        merged_dietary = list(set(existing_data.get("dietaryPreferences", []) + dietary_preferences))
        merged_allergies = list(set(existing_data.get("allergies", []) + allergies))
        merged_foods = list(set(existing_data.get("favoriteFoods", []) + favorite_foods))

        payload = {
            "userId": DEFAULT_USER,
            "dietaryPreferences": merged_dietary,
            "allergies": merged_allergies,
            "favoriteFoods": merged_foods
        }
        res = requests.put(url, json=payload, timeout=1.5)
        res.raise_for_status()
        return "Successfully updated preferences on the live server."
    except Exception as e:
        logger.error(f"Failed to write preferences to Express, caching locally: {e}")
        profile = load_user_profile()
        profile["preferences"] = list(set(profile.get("preferences", []) + dietary_preferences))
        profile["allergies"] = list(set(profile.get("allergies", []) + allergies))
        profile["user_facts"] = list(set(profile.get("user_facts", []) + favorite_foods))
        save_user_profile(profile)
        return "Updated preferences locally (Express server offline)."


def update_user_profile_facts(fact: str) -> str:
    """Fallback method for adding simple unclassified text facts."""
    profile = load_user_profile()
    fact_strip = fact.strip()
    if fact_strip and fact_strip not in profile["user_facts"]:
        profile["user_facts"].append(fact_strip)
        save_user_profile(profile)
        # Attempt to sync with Express as a favoriteFood preference
        save_preferences_express(dietary_preferences=[], allergies=[], favorite_foods=[fact_strip])
        return f"Recorded new fact: '{fact_strip}'"
    return "Fact already recorded."


def search_exercises_db(query: str) -> List[Dict[str, Any]]:
    """Searches the exercise knowledge base for matching exercises."""
    query_lower = query.lower()
    results = []
    for name, details in EXERCISE_DB.items():
        if query_lower in name or query_lower in details["description"].lower():
            results.append({"name": name, **details})
    if not results:
        return [{"name": name, "description": details["description"]} for name, details in EXERCISE_DB.items()]
    return results


def search_meals_db(query: str) -> List[Dict[str, Any]]:
    """Searches the nutrition knowledge base for meals."""
    query_lower = query.lower()
    results = []
    for name, details in NUTRITION_DB.items():
        if (query_lower in name or 
            query_lower in details["name"].lower() or 
            any(query_lower in ing.lower() for ing in details["ingredients"])):
            results.append(details)
    if not results:
        return [{"name": details["name"], "calories": details["calories"]} for details in NUTRITION_DB.values()]
    return results

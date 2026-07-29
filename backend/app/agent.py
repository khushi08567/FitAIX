import os
import re
import json
import logging
from typing import List, Dict, Any
import ollama

from app.config import settings
from app.schemas import ChatResponse
from app.database import (
    load_user_profile,
    update_user_profile_facts,
    search_exercises_db,
    search_meals_db,
    add_hydration_log,
    log_meal_entry,
    save_preferences_express
)

logger = logging.getLogger("fitaix.agent")

SYSTEM_INSTRUCTION = """
You are the FitAI Coach, an elite personal trainer, nutritionist, and empathetic wellness coach.
Your client's name is Simran. Your personality is professional, warm, highly motivational, and evidence-based.

Core Operational Rules:
1. Empathy & Tone: Always check the user's recovery score, sleep, and active injuries in the context. Adjust your message tone based on their physical state. If they are sore (recovery score < 50) or injured, be supportive, recommend light recovery or modified movements, and reassure them that rest is part of progress.
2. Conversational Message: Write your main 'message' in 2-3 short, highly natural paragraphs. Do NOT include markdown bullet points, tables, or text-based mock cards inside the 'message' field. Instead, write like a real coach sending a message on WhatsApp.
3. Structured Cards: If you recommend a specific workout, a meal/recipe, or a comparison between exercises/foods, you MUST populate the 'ui_card_type' and 'ui_card_data' fields with the appropriate card JSON schema.
   - Workout Recommendations -> ui_card_type: 'WorkoutCard'
   - Nutrition/Meals -> ui_card_type: 'NutritionCard'
   - Comparisons (e.g. White Rice vs Brown Rice, or Squat vs Leg Press) -> ui_card_type: 'ComparisonCard'
4. Injury Avoidance: Never recommend deep knee flexion, high-impact jumps, or heavy squatting if the user has knee pain or patellar tendinitis. Offer safe, knee-friendly alternatives (like glute bridges or leg press with limited range of motion) and explicitly explain why.

You MUST return a JSON object matching this schema:
{
  "message": "Friendly, conversational response paragraphs (string)",
  "ui_card_type": "WorkoutCard" | "NutritionCard" | "ComparisonCard" | null,
  "ui_card_data": { ... card data ... } | null,
  "emotion_tone": "friendly" | "empathetic" | "celebratory" | "informative" | "warning"
}

--- CARD SCHEMAS ---

If ui_card_type is "WorkoutCard", ui_card_data MUST match:
{
  "workout_name": "Name of the workout routine (string)",
  "estimated_duration_mins": duration in minutes (number),
  "calories_burned": estimated calories burned (number),
  "exercises": [
    {
      "name": "Exercise name e.g. Romanian Deadlift (string)",
      "sets": "number or range e.g. 3 (string or number)",
      "reps": "number or range e.g. 10-12 (string or number)",
      "notes": "safe form instruction or injury-avoidance tip e.g. keep spine flat (string, optional)"
    }
  ],
  "warnings": ["injury safety alert or knee warnings e.g. avoid squatting deep (string, optional)"]
}

If ui_card_type is "NutritionCard", ui_card_data MUST match:
{
  "meal_name": "Name of the meal (string)",
  "calories": total calories (number),
  "protein_g": protein in grams (number),
  "carbs_g": carbs in grams (number),
  "fats_g": fats in grams (number),
  "ingredients": ["ingredient line 1", "ingredient line 2"],
  "instructions": ["cooking step 1", "cooking step 2"]
}

If ui_card_type is "ComparisonCard", ui_card_data MUST match:
{
  "item_a": {
    "name": "First item e.g. Squat (string)",
    "pros": ["pro 1", "pro 2"],
    "cons": ["con 1", "con 2"]
  },
  "item_b": {
    "name": "Second item e.g. Leg Press (string)",
    "pros": ["pro 1", "pro 2"],
    "cons": ["con 1", "con 2"]
  },
  "overall_verdict": "Which is better for the user's specific context (injury/goal) and why (string)"
}
"""

def clean_and_repair_json(raw_str: str) -> str:
    """
    Cleans and repairs common tiny-LLM JSON syntax errors (like single quotes,
    trailing commas, or wrapping markdown code blocks).
    """
    if not raw_str:
        return ""
        
    cleaned = raw_str.strip()
    
    # Remove markdown code block wraps
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()
    
    # Fix single quotes around JSON properties / keys
    cleaned = re.sub(r"'(?=\s*[\{\}\[\]\:\,])|(?<=[\{\}\[\]\:\,])\s*'", '"', cleaned)
    
    # Remove trailing commas before closing braces
    cleaned = re.sub(r',\s*\}', '}', cleaned)
    cleaned = re.sub(r',\s*\]', ']', cleaned)
    
    return cleaned


def parse_and_execute_chat_actions(user_message: str) -> List[str]:
    """
    Highly robust intent-parsing that captures user tracking inputs for water, meals,
    and preferences, and immediately performs Express API mutations.
    """
    msg_lower = user_message.lower()
    actions_taken = []
    
    # 1. Capture Hydration: Matches any combination of digits + ml/water
    water_match = re.search(r'(\d+)\s*(?:ml|milliliters)?\s*(?:of\s+)?water', msg_lower)
    if not water_match:
        # Fallback to search for just digits + "ml"
        water_match = re.search(r'(\d+)\s*ml', msg_lower)
        
    if water_match:
        amount = int(water_match.group(1))
        result = add_hydration_log(amount)
        actions_taken.append(f"[System Action Success: {result}]")
        
    # 2. Capture Meal logging: Match against recipe keys
    food_items = {
        "greek yogurt bowl": {"name": "High-Protein Greek Yogurt Bowl", "calories": 280, "protein": 24, "carbs": 30, "fat": 4, "type": "snack"},
        "yogurt bowl": {"name": "High-Protein Greek Yogurt Bowl", "calories": 280, "protein": 24, "carbs": 30, "fat": 4, "type": "snack"},
        "protein shake": {"name": "Whey/Plant Protein Recovery Shake", "calories": 210, "protein": 30, "carbs": 12, "fat": 3, "type": "snack"},
        "shake": {"name": "Whey/Plant Protein Recovery Shake", "calories": 210, "protein": 30, "carbs": 12, "fat": 3, "type": "snack"},
        "tofu scramble": {"name": "Savory Tofu & Spinach Scramble", "calories": 320, "protein": 22, "carbs": 15, "fat": 18, "type": "breakfast"},
        "scramble": {"name": "Savory Tofu & Spinach Scramble", "calories": 320, "protein": 22, "carbs": 15, "fat": 18, "type": "breakfast"}
    }
    
    logged_recipe = False
    for key, macros in food_items.items():
        if key in msg_lower:
            result = log_meal_entry(
                name=macros["name"],
                calories=macros["calories"],
                protein=macros["protein"],
                carbs=macros["carbs"],
                fat=macros["fat"],
                meal_type=macros["type"]
            )
            actions_taken.append(f"[System Action Success: {result}]")
            logged_recipe = True
            break

    # 3. Capture Generic Macronutrients and Calories Logging (if no specific recipe was matched)
    if not logged_recipe:
        parsed_calories = 0
        parsed_protein = 0
        parsed_carbs = 0
        parsed_fat = 0
        logged_any_macro = False

        # Check for Calories
        cal_match = re.search(r'(\d+)\s*(?:cal|calories|kcal)', msg_lower)
        if cal_match:
            parsed_calories = int(cal_match.group(1))
            logged_any_macro = True

        # Check for Protein
        prot_match = re.search(r'(\d+)\s*g?\s*protein', msg_lower)
        if not prot_match:
            prot_match = re.search(r'protein\s*(?:of\s+)?(\d+)', msg_lower)
        if prot_match:
            parsed_protein = int(prot_match.group(1))
            logged_any_macro = True
            if parsed_calories == 0:
                parsed_calories += parsed_protein * 4

        # Check for Carbs
        carb_match = re.search(r'(\d+)\s*g?\s*(?:carbs|carbohydrates)', msg_lower)
        if not carb_match:
            carb_match = re.search(r'(?:carbs|carbohydrates)\s*(?:of\s+)?(\d+)', msg_lower)
        if carb_match:
            parsed_carbs = int(carb_match.group(1))
            logged_any_macro = True
            if parsed_calories == 0 or cal_match is None:
                parsed_calories += parsed_carbs * 4

        # Check for Fat
        fat_match = re.search(r'(\d+)\s*g?\s*fat', msg_lower)
        if not fat_match:
            fat_match = re.search(r'fat\s*(?:of\s+)?(\d+)', msg_lower)
        if fat_match:
            parsed_fat = int(fat_match.group(1))
            logged_any_macro = True
            if parsed_calories == 0 or cal_match is None:
                parsed_calories += parsed_fat * 9

        if logged_any_macro:
            log_parts = []
            if parsed_protein > 0: log_parts.append(f"{parsed_protein}g Protein")
            if parsed_carbs > 0: log_parts.append(f"{parsed_carbs}g Carbs")
            if parsed_fat > 0: log_parts.append(f"{parsed_fat}g Fat")
            if parsed_calories > 0 and not log_parts: log_parts.append(f"{parsed_calories} kcal")
            
            name = "Quick Chat Log: " + ", ".join(log_parts)
            result = log_meal_entry(
                name=name,
                calories=parsed_calories,
                protein=parsed_protein,
                carbs=parsed_carbs,
                fat=parsed_fat,
                meal_type="snack"
            )
            actions_taken.append(f"[System Action Success: {result}]")
            
    # 4. Capture Food Preference selections (using exact lowercase/hyphenated IDs matching front-end options)
    if "vegetarian" in msg_lower:
        result = save_preferences_express(dietary_preferences=["vegetarian"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "vegan" in msg_lower:
        result = save_preferences_express(dietary_preferences=["vegan"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "halal" in msg_lower:
        result = save_preferences_express(dietary_preferences=["halal"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "jain" in msg_lower:
        result = save_preferences_express(dietary_preferences=["jain"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "high protein" in msg_lower or "high-protein" in msg_lower:
        result = save_preferences_express(dietary_preferences=["high-protein"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "low carb" in msg_lower or "low-carb" in msg_lower:
        result = save_preferences_express(dietary_preferences=["low-carb"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "keto" in msg_lower:
        result = save_preferences_express(dietary_preferences=["keto"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "gluten free" in msg_lower or "gluten-free" in msg_lower:
        result = save_preferences_express(dietary_preferences=["gluten-free"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "dairy free" in msg_lower or "dairy-free" in msg_lower:
        result = save_preferences_express(dietary_preferences=["dairy-free"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
        
    # 5. Capture Food Allergy declarations (matches exact first-letter-capitalized IDs: 'Peanuts', 'Tree Nuts', etc.)
    if any(keyword in msg_lower for keyword in ["allerg", "avoid", "cannot eat", "can't eat", "no eggs", "no dairy", "no soy"]):
        matched_allergies = []
        if "peanut" in msg_lower:
            matched_allergies.append("Peanuts")
        if "tree nut" in msg_lower or ("nut" in msg_lower and "peanut" not in msg_lower):
            matched_allergies.append("Tree Nuts")
        if "dairy" in msg_lower or "milk" in msg_lower or "lactose" in msg_lower:
            matched_allergies.append("Dairy")
        if "egg" in msg_lower:
            matched_allergies.append("Eggs")
        if "soy" in msg_lower:
            matched_allergies.append("Soy")
        if "shellfish" in msg_lower or "shrimp" in msg_lower or "seafood" in msg_lower:
            matched_allergies.append("Shellfish")
        if "wheat" in msg_lower or "gluten" in msg_lower:
            matched_allergies.append("Wheat")

        if matched_allergies:
            result = save_preferences_express(dietary_preferences=[], allergies=matched_allergies, favorite_foods=[])
            actions_taken.append(f"[System Action Success: {result}]")

    # 6. Capture Favorite Foods declarations (extracts just the foods, rather than the full sentence)
    if any(keyword in msg_lower for keyword in ["favorite food", "i like ", "i love ", "prefer to eat"]):
        food_match = re.search(r'(?:favorite food|i like|i love|prefer to eat)\s+(?:is|to eat)?\s*([a-zA-Z\s,]+)', msg_lower)
        if food_match:
            food_item = food_match.group(1).replace("only", "").replace("and", ",").strip()
            foods = [f.strip() for f in food_item.split(",") if len(f.strip()) > 2]
            if foods:
                result = save_preferences_express(dietary_preferences=[], allergies=[], favorite_foods=foods)
                actions_taken.append(f"[System Action Success: {result}]")

    return actions_taken


def detect_and_log_memory(user_message: str):
    """
    Heuristically checks if the user is sharing personal constraints, goals, or pain levels,
    and logs them permanently to user_profile.json and updates remote Express preferences.
    Filters out direct command statements to avoid polluting the Favorite Foods list.
    """
    msg_lower = user_message.lower()
    
    # Filter out direct commands and allergy/preference statements
    if any(cmd in msg_lower for cmd in ["ml", "water", "log", "drank", "add", "change my preference", "intake", "taken", "allergy", "allergic", "avoid"]):
        return
        
    personal_triggers = [
        "i am ", "i have ", "i prefer ", "i hate ", "i like ", 
        "my knee", "my shoulder", "my back", "pain", "sore", 
        "vegetarian", "dairy-free", "gluten-free"
    ]
    
    if any(trigger in msg_lower for trigger in personal_triggers):
        update_user_profile_facts(user_message)


def build_prompt_with_context(user_message: str, retrieved_rag_data: List[str]) -> str:
    """Loads user profile details and any retrieved RAG facts to compile the prompt context."""
    profile = load_user_profile()
    
    injuries_str = ", ".join(profile.get("injuries", [])) or "None"
    preferences_str = ", ".join(profile.get("preferences", [])) or "None"
    facts_str = ", ".join(profile.get("user_facts", [])) or "None"
    
    calories_consumed = profile.get("calories_consumed", 0)
    calories_limit = profile.get("calories_limit", 2000)
    calories_remaining = max(0, calories_limit - calories_consumed)
    
    protein_consumed = profile.get("protein_consumed_g", 0)
    protein_target = profile.get("protein_target_g", 120)
    protein_remaining = max(0, protein_target - protein_consumed)
    
    water_consumed = profile.get("hydration_consumed_ml", 0)
    water_target = profile.get("hydration_target_ml", 2500)
    
    rag_context = "\n".join(retrieved_rag_data) if retrieved_rag_data else "No additional exercise or recipe lookup needed."
    
    context = f"""
--- USER PROFILE CONTEXT ---
Client Name: {profile.get('name', 'Simran')}
Age: {profile.get('age')}
Height: {profile.get('height_cm')} cm
Weight: {profile.get('weight_kg')} kg
Goal: {profile.get('goal')}
Today's Scheduled Workout: {profile.get('today_workout_focus')}
Sleep Last Night: {profile.get('sleep_hours')} hours
Recovery Score: {profile.get('recovery_score')}%

-- Real-Time Nutrition Totals (Express Backend Synchronized) --
Daily Calorie Allowance: {calories_limit} kcal
Calories Consumed Today: {calories_consumed} kcal (Remaining: {calories_remaining} kcal)
Protein Target: {protein_target} g
Protein Consumed Today: {protein_consumed} g (Remaining: {protein_remaining} g)
Hydration Intake Today: {water_consumed} ml (Target: {water_target} ml)

Active Injuries/Pain: {injuries_str}
Dietary & Training Preferences: {preferences_str}
Known Personal Facts: {facts_str}
---------------------------

--- RETRIEVED KNOWLEDGE BASE CONTEXT ---
{rag_context}
----------------------------------------

USER QUESTION:
{user_message}
"""
    return context


def run_chat_agent(user_message: str, history: List[Dict[str, Any]] = None) -> ChatResponse:
    """
    Executes the chatbot agent using local Ollama.
    """
    # 1. Parse conversational statements to execute Express API actions (water, meals, macros)
    actions_taken = parse_and_execute_chat_actions(user_message)
    
    # 2. Check for personal facts to log in memory
    detect_and_log_memory(user_message)
    
    # 3. Retrieve exercise or meal context if relevant keyword is found
    retrieved_data = []
    retrieved_data.extend(actions_taken)
    
    msg_lower = user_message.lower()
    
    exercise_keywords = ["workout", "exercise", "squat", "press", "deadlift", "bridge", "form", "reps", "sets", "knee"]
    if any(kw in msg_lower for kw in exercise_keywords):
        exercises = search_exercises_db(user_message)
        if exercises:
            retrieved_data.append(f"Exercise Guide context: {json.dumps(exercises)}")
            
    nutrition_keywords = ["recipe", "eat", "meal", "food", "calorie", "protein", "yogurt", "carb", "shake", "tofu"]
    if any(kw in msg_lower for kw in nutrition_keywords):
        meals = search_meals_db(user_message)
        if meals:
            retrieved_data.append(f"Meal/Recipe context: {json.dumps(meals)}")
            
    # 4. Compile prompt
    prompt = build_prompt_with_context(user_message, retrieved_data)
    
    # 5. Construct messages for Ollama API
    messages = []
    messages.append({"role": "system", "content": SYSTEM_INSTRUCTION})
    
    if history:
        for msg in history:
            role = msg.get("role")
            text = msg.get("text")
            if role and text:
                messages.append({
                    "role": "user" if role == "user" else "assistant",
                    "content": text
                })
                
    messages.append({"role": "user", "content": prompt})
    
    # Tuned generation settings to optimize processing latency on local CPU/GPU hardware
    ollama_options = {
        "temperature": 0.3,
        "num_predict": 750,
        "num_ctx": 1536
    }
    
    json_content = ""
    try:
        client = ollama.Client(host=settings.ollama_host)
        
        try:
            response = client.chat(
                model=settings.ollama_model,
                messages=messages,
                format=ChatResponse.model_json_schema(),
                options=ollama_options
            )
        except Exception:
            response = client.chat(
                model=settings.ollama_model,
                messages=messages,
                format="json",
                options=ollama_options
            )
            
        json_content = response["message"]["content"]
        if not json_content:
            raise ValueError("Ollama returned an empty response.")
            
        # Clean and parse JSON
        repaired_json = clean_and_repair_json(json_content)
        data = json.loads(repaired_json)
        response_obj = ChatResponse(**data)
        
        # Prepend explicit system log confirmation if database actions succeeded
        if actions_taken:
            clean_actions = []
            for action in actions_taken:
                clean_act = action.replace("[System Action Success: ", "").replace("]", "")
                clean_actions.append(clean_act)
            action_header = " | ".join(clean_actions)
            response_obj.message = f"💬 [Action Logged: {action_header}]\n\n{response_obj.message}"
            
        return response_obj
        
    except Exception as e:
        logger.error(f"Error in Ollama local agent: {e}", exc_info=True)
        
        # Parse fallback content
        fallback_msg = "Here is a safe, knee-friendly lower body routine for today, focusing on glute and hamstring strengthening to support recovery from patellar tendinitis!"
        
        # If user asks for a workout or exercise, build a safe dynamic workout card manually in fallback
        if "workout" in msg_lower or "exercise" in msg_lower:
            response_obj = ChatResponse(
                message=fallback_msg,
                ui_card_type="WorkoutCard",
                ui_card_data={
                    "workout_name": "Knee-Safe Lower Body Focus",
                    "estimated_duration_mins": 25,
                    "calories_burned": 180,
                    "exercises": [
                        {"name": "Glute Bridges", "sets": 3, "reps": 15, "notes": "Hold squeeze at the top. Safe for knee joints."},
                        {"name": "Romanian Deadlifts", "sets": 3, "reps": 10, "notes": "Hinge at hips. Strengthens posterior chain."},
                        {"name": "Seated Calf Raises", "sets": 3, "reps": 15, "notes": "Strengthens ankles & calf muscles control."}
                    ],
                    "warnings": ["Avoid deep squatting and high-impact jumping exercises."]
                },
                emotion_tone="informative"
            )
        else:
            fallback_text = "I'm here to support you, but I had a little trouble processing your query on my local model. Make sure Ollama is running! How are your knees feeling today?"
            response_obj = ChatResponse(
                message=fallback_text,
                ui_card_type=None,
                ui_card_data=None,
                emotion_tone="warning"
            )

        if actions_taken:
            clean_actions = [a.replace("[System Action Success: ", "").replace("]", "") for a in actions_taken]
            action_header = " | ".join(clean_actions)
            response_obj.message = f"💬 [Action Logged: {action_header}]\n\n{response_obj.message}"
            
        return response_obj

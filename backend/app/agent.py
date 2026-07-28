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
  "ui_card_data": { ... matches the selected card schema ... } | null,
  "emotion_tone": "friendly" | "empathetic" | "celebratory" | "informative" | "warning"
}
"""

def parse_and_execute_chat_actions(user_message: str) -> List[str]:
    """
    Highly robust intent-parsing that captures user tracking inputs for water, meals,
    and preferences, and immediately performs Express API mutations.
    """
    msg_lower = user_message.lower()
    actions_taken = []
    
    # 1. Capture Hydration: Matches any combination of digits + ml/water
    # Matches: "400ml", "400 ml", "400 ml of water", "taken 400ml", "water intake 500ml", "added 300 ml water"
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
            break
            
    # 3. Capture Food Preference selections
    if "vegetarian" in msg_lower:
        result = save_preferences_express(dietary_preferences=["Vegetarian"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "vegan" in msg_lower:
        result = save_preferences_express(dietary_preferences=["Vegan"], allergies=[], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
    elif "allergic to peanut" in msg_lower or "peanut allergy" in msg_lower:
        result = save_preferences_express(dietary_preferences=[], allergies=["Peanuts"], favorite_foods=[])
        actions_taken.append(f"[System Action Success: {result}]")
        
    return actions_taken


def detect_and_log_memory(user_message: str):
    """
    Heuristically checks if the user is sharing personal constraints, goals, or pain levels,
    and logs them permanently to user_profile.json and updates remote Express preferences.
    """
    msg_lower = user_message.lower()
    
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
    # 1. Parse conversational statements to execute Express API actions (water, meals)
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
    
    # Speed & latency options to execute faster
    ollama_options = {
        "temperature": 0.3,     # Lower temperature is faster
        "num_predict": 180,     # Limit token length to guarantee quick replies
        "num_ctx": 2048         # Keep context limit compact to fit in graphics RAM/CPU memory
    }
    
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
            
        data = json.loads(json_content)
        response_obj = ChatResponse(**data)
        
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
        return ChatResponse(
            message="I'm here to support you, but I had a little trouble processing your query on my local model. Make sure Ollama is running! How are your knees feeling today?",
            ui_card_type=None,
            ui_card_data=None,
            emotion_tone="warning"
        )

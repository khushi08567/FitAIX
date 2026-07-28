from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any

class ExerciseItem(BaseModel):
    name: str = Field(description="Name of the exercise (e.g. Dumbbell Bench Press)")
    sets: int = Field(description="Number of sets")
    reps: str = Field(description="Number of reps or duration (e.g. '8-10' or '30s')")
    notes: Optional[str] = Field(None, description="Execution notes, tempo, or modifications")

class WorkoutCard(BaseModel):
    workout_name: str = Field(description="Name or target focus of the workout")
    exercises: List[ExerciseItem] = Field(description="List of exercises in this workout")
    estimated_duration_mins: int = Field(description="Estimated duration in minutes")
    calories_burned: int = Field(description="Estimated calories burned")
    warnings: Optional[List[str]] = Field(None, description="Any safety warnings or injury adjustments (e.g. 'Keep weight light due to knee pain')")

class NutritionCard(BaseModel):
    meal_name: str = Field(description="Name of the meal or snack")
    calories: int = Field(description="Total calories")
    protein_g: int = Field(description="Protein in grams")
    carbs_g: int = Field(description="Carbohydrates in grams")
    fats_g: int = Field(description="Fats in grams")
    ingredients: List[str] = Field(description="List of ingredients")
    instructions: Optional[List[str]] = Field(None, description="Brief preparation steps")

class ComparisonItem(BaseModel):
    name: str = Field(description="Name of the item")
    pros: List[str] = Field(description="Pros of this choice")
    cons: List[str] = Field(description="Cons of this choice")
    verdict: str = Field(description="When to choose this item")

class ComparisonCard(BaseModel):
    title: str = Field(description="Title of the comparison (e.g. Bench Press vs Dumbbell Press)")
    item_a: ComparisonItem = Field(description="First item in comparison")
    item_b: ComparisonItem = Field(description="Second item in comparison")
    overall_verdict: str = Field(description="Summary recommendation based on user goals")

class ChatResponse(BaseModel):
    message: str = Field(
        description="The primary text response from the coach, written in a friendly, conversational, evidence-based tone. "
                    "Use 2-3 short, natural paragraphs. Do NOT include markdown bulleted lists or raw text cards here, as those are formatted in the card data."
    )
    ui_card_type: Optional[str] = Field(
        None, 
        description="Type of card if presenting structured data. Must be one of: 'WorkoutCard', 'NutritionCard', 'ComparisonCard' or null if it is a general chat response."
    )
    ui_card_data: Optional[Union[WorkoutCard, NutritionCard, ComparisonCard]] = Field(
        None, 
        description="The detailed card object conforming to the ui_card_type schema."
    )
    emotion_tone: str = Field(
        "friendly", 
        description="Tone indicator for frontend text-to-speech or avatar: friendly, empathetic, celebratory, informative, warning."
    )

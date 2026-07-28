import os
from fastapi.testclient import TestClient
from app.main import app
from app.schemas import ChatResponse, WorkoutCard, NutritionCard, ComparisonCard

client = TestClient(app)

def test_health_check():
    """Verifies the health check endpoint returns 200 OK."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FitAIX Chatbot API"

def test_get_profile():
    """Verifies that the default profile loads correctly."""
    response = client.get("/api/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Simran"
    assert "left knee patellar tendinitis" in data["injuries"][0]

def test_response_schemas():
    """Verifies that the schemas instantiate and validate correctly."""
    workout = WorkoutCard(
        workout_name="Knee-Friendly Legs",
        exercises=[{"name": "Glute Bridges", "sets": 3, "reps": "12"}],
        estimated_duration_mins=20,
        calories_burned=100
    )
    
    response = ChatResponse(
        message="Here is a knee-friendly session for you.",
        ui_card_type="WorkoutCard",
        ui_card_data=workout,
        emotion_tone="friendly"
    )
    
    assert response.ui_card_type == "WorkoutCard"
    assert response.ui_card_data.workout_name == "Knee-Friendly Legs"

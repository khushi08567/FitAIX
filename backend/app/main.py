import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

from app.agent import run_chat_agent
from app.database import load_user_profile, save_user_profile
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fitaix.main")

app = FastAPI(
    title="FitAIX Chatbot API",
    description="Backend API for FitAIX Chatbot supporting structured coach responses and user state memory",
    version="1.0.0"
)

# CORS configuration to allow local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None # Expected format: [{"role": "user"|"model", "text": "..."}]

@app.get("/")
def read_root():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "FitAIX Chatbot API",
        "gemini_api_key_configured": bool(settings.gemini_api_key)
    }

@app.get("/api/profile")
def get_profile():
    """Retrieves the current user's profile and injuries."""
    return load_user_profile()

@app.post("/api/profile")
def update_profile(profile: dict):
    """Updates the user profile values directly."""
    try:
        save_user_profile(profile)
        return {"status": "success", "message": "Profile updated successfully", "data": profile}
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to save profile changes")

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    """
    Core text-chat endpoint.
    Expects user message and history, returns a structured ChatResponse (JSON cards).
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be blank")
        
    try:
        response = run_chat_agent(request.message, request.history)
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

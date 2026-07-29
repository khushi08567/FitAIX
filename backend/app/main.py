import os
import re
import json
import base64
import logging
import tempfile
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import edge_tts
import speech_recognition as sr

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
    description="Backend API for FitAIX Chatbot supporting structured coach responses, memory, and voice synthesis",
    version="1.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    is_voice: Optional[bool] = False

async def synthesize_voice_base64(text: str) -> str:
    """
    Synthesizes the text response into a highly human-like neural MP3 audio string.
    Uses edge-tts (free Microsoft Neural TTS en-US-EmmaNeural voice).
    """
    if not text:
        return ""
    
    # Strip system log headers from spoken TTS so Rachel doesn't speak out the bracketed log
    clean_text = re.sub(r'💬\s*\[Action Logged:[^\]]+\]\s*', '', text)
    
    try:
        communicate = edge_tts.Communicate(clean_text, "en-US-EmmaNeural")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            temp_path = temp_audio.name
            
        await communicate.save(temp_path)
        
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
            
        try:
            os.remove(temp_path)
        except Exception:
            pass
            
        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        return f"data:audio/mp3;base64,{base64_audio}"
    except Exception as e:
        logger.error(f"Failed to synthesize voice using edge-tts: {e}")
        return ""

@app.get("/")
def read_root():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "FitAIX Chatbot API",
        "voice_support": True
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
async def chat_endpoint(request: ChatRequest):
    """
    Core text-chat endpoint. Supports returning base64 voice feedback if is_voice is True.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be blank")
        
    try:
        response = run_chat_agent(request.message, request.history)
        
        # If voice response requested, generate the human-like voice audio file
        voice_audio = ""
        if request.is_voice:
            voice_audio = await synthesize_voice_base64(response.message)
            
        # Package response data including optional audio feedback
        res_dict = response.model_dump()
        res_dict["voice_audio"] = voice_audio
        return res_dict
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

@app.post("/api/chat/voice")
async def chat_voice_endpoint(
    audio: UploadFile = File(...),
    history: Optional[str] = Form(None)
):
    """
    Voice upload endpoint. Accepts recorded audio files, transcribes them, 
    runs chatbot agents, and returns both structured cards and a human voice response.
    """
    history_list = []
    if history:
        try:
            history_list = json.loads(history)
        except Exception as e:
            logger.warning(f"Failed to parse history Form data: {e}")

    temp_input_path = ""
    try:
        # Save uploaded audio to temporary file
        suffix = os.path.splitext(audio.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_input:
            temp_input_path = temp_input.name
            content = await audio.read()
            temp_input.write(content)

        # Transcribe audio using SpeechRecognition (Google Free Web STT)
        r = sr.Recognizer()
        try:
            with sr.AudioFile(temp_input_path) as source:
                audio_data = r.record(source)
            transcribed_text = r.recognize_google(audio_data)
            logger.info(f"Speech recognition transcribed: '{transcribed_text}'")
        except Exception as sr_err:
            logger.error(f"STT Conversion Error: {sr_err}")
            raise HTTPException(status_code=422, detail="Failed to transcribe audio. Make sure you speak clearly!")
        
        # Run chatbot logic on transcribed text
        response = run_chat_agent(transcribed_text, history_list)
        
        # Synthesize voice output
        voice_audio = await synthesize_voice_base64(response.message)
        
        res_dict = response.model_dump()
        res_dict["user_transcribed_text"] = transcribed_text
        res_dict["voice_audio"] = voice_audio
        return res_dict

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Voice chat endpoint failure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice process failed: {str(e)}")
    finally:
        # Clean up temporary audio input files
        if temp_input_path and os.path.exists(temp_input_path):
            try:
                os.remove(temp_input_path)
            except Exception:
                pass

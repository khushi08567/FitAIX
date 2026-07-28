import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    gemini_api_key: str = ""
    port: int = 8000
    host: str = "0.0.0.0"
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "gemma2:2b"

    model_config = SettingsConfigDict(
        # Load from .env in the parent directory (backend/.env)
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

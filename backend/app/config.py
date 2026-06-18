from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    LLM_MODEL: str = "llama3.2:3b"  # Lightweight model for document analysis via Ollama
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    FAISS_INDEX_PATH: str = "./data/faiss_index"
    UPLOAD_DIR: str = "./data/uploads"
    DATABASE_URL: str = "postgresql+asyncpg://avanam:avanam@localhost:5432/avanam"
    REDIS_URL: str = "redis://localhost:6379/0"
    CRITIC_CONFIDENCE_THRESHOLD: float = 0.7
    MAX_REVISION_LOOPS: int = 2
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()

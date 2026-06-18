from langchain_core.language_models.chat_models import BaseChatModel
from app.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)

def get_llm(temperature: float = 0.0, max_tokens: int = 1024) -> BaseChatModel:
    """
    Returns the Ollama LLM instance.
    Ollama is the sole LLM provider for this application.
    """
    settings = get_settings()
    model_name = settings.LLM_MODEL

    logger.info(f"Initializing Ollama LLM, model: {model_name}, base_url: {settings.OLLAMA_BASE_URL}")

    from langchain_community.chat_models import ChatOllama
    return ChatOllama(
        model=model_name,
        temperature=temperature,
        base_url=settings.OLLAMA_BASE_URL,
        num_predict=max_tokens,
    )

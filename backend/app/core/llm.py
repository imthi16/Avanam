from langchain_core.language_models.chat_models import BaseChatModel
from app.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)

def get_llm(temperature: float = 0.0, max_tokens: int = 1024) -> BaseChatModel:
    """
    Factory function to return the configured LLM provider.
    """
    settings = get_settings()
    provider = settings.LLM_PROVIDER.lower().strip()
    model_name = settings.LLM_MODEL
    
    logger.info(f"Initializing LLM provider: {provider}, model: {model_name}")

    if provider == "groq":
        from langchain_groq import ChatGroq
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise ValueError("GROQ_API_KEY is missing in .env but LLM_PROVIDER is set to groq")
        return ChatGroq(
            model=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=api_key
        )
        
    elif provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            model=model_name,
            temperature=temperature,
            base_url=settings.OLLAMA_BASE_URL,
        )
        
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing in .env but LLM_PROVIDER is set to gemini")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            google_api_key=api_key
        )
        
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}. Must be 'groq', 'ollama', or 'gemini'.")

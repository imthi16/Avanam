from functools import lru_cache

from langchain_community.chat_models import ChatOllama
from langchain_core.language_models.chat_models import BaseChatModel

from app.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=None)
def _build_llm(
    model_name: str,
    base_url: str,
    temperature: float,
    max_tokens: int,
    json_mode: bool,
) -> BaseChatModel:
    """Build (and cache) a ChatOllama client for a given configuration."""
    logger.debug(
        "Initializing Ollama LLM",
        model=model_name,
        base_url=base_url,
        json_mode=json_mode,
    )
    return ChatOllama(
        model=model_name,
        temperature=temperature,
        base_url=base_url,
        num_predict=max_tokens,
        # When json_mode is on, Ollama constrains the output to valid JSON,
        # which removes the fragile "strip the markdown fences and hope" parsing.
        format="json" if json_mode else "",
    )


def get_llm(
    temperature: float = 0.0,
    max_tokens: int = 1024,
    json_mode: bool = False,
) -> BaseChatModel:
    """
    Returns a cached Ollama LLM instance.

    Ollama is the sole LLM provider for this application. Instances are cached
    per-configuration so we don't rebuild a client on every agent invocation.

    Set ``json_mode=True`` for nodes that must return structured JSON (router,
    analyst, critic). Leave it off for free-form text (formatter).
    """
    settings = get_settings()
    return _build_llm(
        settings.LLM_MODEL,
        settings.OLLAMA_BASE_URL,
        temperature,
        max_tokens,
        json_mode,
    )

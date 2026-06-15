from langchain_huggingface import HuggingFaceEmbeddings
from app.config import get_settings

_embedding_model = None

def get_embedding_model() -> HuggingFaceEmbeddings:
    global _embedding_model
    if _embedding_model is None:
        settings = get_settings()
        _embedding_model = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    return _embedding_model

from langchain_huggingface import HuggingFaceEmbeddings
from app.config import get_settings

_embedding_model = None


def get_embedding_model() -> HuggingFaceEmbeddings:
    global _embedding_model
    if _embedding_model is None:
        settings = get_settings()
        _embedding_model = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            # L2-normalize embeddings so squared-L2 distance maps cleanly to
            # cosine similarity (see vectorstore_service.l2_squared_to_cosine).
            encode_kwargs={"normalize_embeddings": True},
        )
    return _embedding_model

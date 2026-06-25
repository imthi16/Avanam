import os
import threading

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LCDocument

from app.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)


def l2_squared_to_cosine(score: float) -> float:
    """
    Convert a FAISS squared-L2 distance into a cosine similarity in [0, 1].

    FAISS ``IndexFlatL2`` (used by LangChain's FAISS wrapper) returns the
    *squared* Euclidean distance. For L2-normalized vectors:

        ||a - b||^2 = 2 - 2 * cos(a, b)   =>   cos(a, b) = 1 - score / 2

    Higher is more relevant. Unrelated chunks (cos <= 0) are clamped to 0.
    """
    similarity = 1.0 - float(score) / 2.0
    return max(0.0, min(1.0, similarity))


class VectorStoreService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreService, cls).__new__(cls)
            cls._instance.vectorstore = None
            cls._instance.index_path = None
            cls._instance.embedding_model = None
            # Guards mutations/reads; FAISS + the docstore are not thread-safe
            # and we now call into them from worker threads (asyncio.to_thread).
            cls._instance._lock = threading.Lock()
        return cls._instance

    def initialize(self, embedding_model, index_path: str):
        self.embedding_model = embedding_model
        self.index_path = index_path

        # Load an existing index from disk if one is present; otherwise stay
        # empty and lazily create the index when the first document arrives.
        if os.path.isdir(index_path) and os.listdir(index_path):
            try:
                self.vectorstore = FAISS.load_local(
                    index_path,
                    embedding_model,
                    allow_dangerous_deserialization=True,
                )
                logger.info("Loaded FAISS index", vectors=self.vectorstore.index.ntotal)
            except Exception as e:
                logger.error("Error loading FAISS index", error=str(e))
                self.vectorstore = None

    def add_documents(self, texts: list[str], metadatas: list[dict], doc_id: str):
        docs = [
            LCDocument(page_content=t, metadata=m) for t, m in zip(texts, metadatas)
        ]
        with self._lock:
            if self.vectorstore is None:
                self.vectorstore = FAISS.from_documents(docs, self.embedding_model)
            else:
                self.vectorstore.add_documents(docs)
            self._save_locked()
        logger.info("Indexed document chunks", doc_id=doc_id, chunks=len(docs))

    def similarity_search(
        self, query: str, k: int | None = None, score_threshold: float | None = None
    ):
        settings = get_settings()
        k = k or settings.RETRIEVAL_K
        if score_threshold is None:
            score_threshold = settings.RETRIEVAL_SCORE_THRESHOLD

        with self._lock:
            if self.vectorstore is None:
                return []
            results = self.vectorstore.similarity_search_with_score(query, k=k)

        out = []
        for doc, raw_score in results:
            similarity = l2_squared_to_cosine(raw_score)
            if similarity < score_threshold:
                continue
            out.append(
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": similarity,
                }
            )
        return out

    def delete_by_doc_id(self, doc_id: str):
        """Remove every chunk belonging to ``doc_id`` from the FAISS index."""
        with self._lock:
            if self.vectorstore is None:
                return
            ids_to_delete = [
                store_id
                for store_id, doc in self.vectorstore.docstore._dict.items()
                if str(doc.metadata.get("doc_id")) == str(doc_id)
            ]
            if ids_to_delete:
                self.vectorstore.delete(ids_to_delete)
                self._save_locked()
        logger.info(
            "Deleted document from index", doc_id=doc_id, chunks=len(ids_to_delete)
        )

    def _save_locked(self):
        """Persist the index. Caller must already hold ``self._lock``."""
        if self.vectorstore is not None and self.index_path:
            os.makedirs(self.index_path, exist_ok=True)
            self.vectorstore.save_local(self.index_path)

    def save(self):
        with self._lock:
            self._save_locked()

    def get_stats(self):
        with self._lock:
            if self.vectorstore is None:
                return {"vector_count": 0, "index_size_bytes": 0}
            vector_count = self.vectorstore.index.ntotal
        size = 0
        if self.index_path and os.path.exists(self.index_path):
            size = sum(
                os.path.getsize(os.path.join(self.index_path, f))
                for f in os.listdir(self.index_path)
                if os.path.isfile(os.path.join(self.index_path, f))
            )
        return {"vector_count": vector_count, "index_size_bytes": size}


vector_store_service = VectorStoreService()

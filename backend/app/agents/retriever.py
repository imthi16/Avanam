from datetime import datetime
from app.agents.state import PipelineState
from app.services.vectorstore_service import vector_store_service

def create_event(agent: str, status: str, step: str, progress: int, data: dict = None) -> dict:
    return {
        "agent": agent,
        "status": status,
        "step": step,
        "progress": progress,
        "data": data or {},
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

def retriever_node(state: PipelineState) -> dict:
    query = state.get("query", "")
    events = [create_event("retriever", "running", "Searching FAISS index", 10)]
    
    try:
        results = vector_store_service.similarity_search(query, k=3)
        events.append(create_event("retriever", "running", "Ranking results", 50))
        
        chunks = []
        scores = []
        for r in results:
            chunks.append({"content": r["content"], "metadata": r["metadata"]})
            scores.append(r["score"])
            
        events.append(create_event("retriever", "complete", "Retrieved chunks", 100, {
            "chunks_found": len(chunks),
            "top_score": scores[0] if scores else 0
        }))
        
        return {
            "retrieved_chunks": chunks,
            "retrieval_scores": scores,
            "events": events
        }
    except Exception as e:
        events.append(create_event("retriever", "error", str(e), 100))
        return {
            "error": str(e),
            "events": events
        }

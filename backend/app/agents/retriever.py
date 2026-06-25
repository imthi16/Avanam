import asyncio
import json
from datetime import datetime, timezone

from app.agents.state import PipelineState
from app.services.vectorstore_service import vector_store_service


def parse_json_response(content: str) -> dict:
    """Parse a model response into a dict, tolerating stray markdown fences."""
    text = content.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


NO_CONTEXT_MESSAGE = (
    "I couldn't find anything relevant in the indexed documents to answer that. "
    "Try rephrasing your question, or upload a document that covers this topic."
)


def create_event(
    agent: str, status: str, step: str, progress: int, data: dict = None
) -> dict:
    return {
        "agent": agent,
        "status": status,
        "step": step,
        "progress": progress,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


async def retriever_node(state: PipelineState) -> dict:
    query = state.get("query", "")
    events = [create_event("retriever", "running", "Searching FAISS index", 10)]

    try:
        # FAISS + embedding lookups are blocking; keep the event loop responsive.
        results = await asyncio.to_thread(vector_store_service.similarity_search, query)
        events.append(create_event("retriever", "running", "Ranking results", 50))

        chunks = [{"content": r["content"], "metadata": r["metadata"]} for r in results]
        scores = [r["score"] for r in results]

        if not chunks:
            # Nothing relevant cleared the threshold — short-circuit instead of
            # asking the analyst to synthesize an answer from no evidence.
            events.append(
                create_event(
                    "retriever",
                    "complete",
                    "No relevant chunks found",
                    100,
                    {"chunks_found": 0},
                )
            )
            return {
                "retrieved_chunks": [],
                "retrieval_scores": [],
                "final_response": NO_CONTEXT_MESSAGE,
                "confidence_score": 0.0,
                "citations": [],
                "events": events,
            }

        events.append(
            create_event(
                "retriever",
                "complete",
                "Retrieved chunks",
                100,
                {
                    "chunks_found": len(chunks),
                    "top_score": round(scores[0], 4) if scores else 0,
                },
            )
        )

        return {
            "retrieved_chunks": chunks,
            "retrieval_scores": scores,
            "events": events,
        }
    except Exception as e:
        events.append(create_event("retriever", "error", str(e), 100))
        return {"error": str(e), "events": events}

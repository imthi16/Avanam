from typing import TypedDict, Annotated, List, Dict
import operator


class PipelineState(TypedDict):
    query: str
    intent: str
    retrieved_chunks: List[Dict]  # {content, metadata, score}
    retrieval_scores: List[float]
    analysis: str
    claims: List[str]
    critique: str
    confidence_score: float
    revision_count: int
    needs_revision: bool
    final_response: str
    citations: List[Dict]  # {index, source, content}
    events: Annotated[List[Dict], operator.add]  # Append-only event stream
    error: str

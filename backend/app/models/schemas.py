from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime


# --- Request Schemas ---

class QueryRequest(BaseModel):
    query: str


# --- SSE Event Schema (not a DB model) ---

class AgentEvent(BaseModel):
    agent: str
    status: str
    step: str
    progress: int
    data: Dict[str, Any]
    timestamp: str


# --- Response Schemas (non-DB) ---

class Citation(BaseModel):
    index: int
    source: str
    content: str


class DocumentListResponse(BaseModel):
    documents: list
    total: int


class ChunkResponse(BaseModel):
    index: int
    content: str
    metadata: Dict[str, Any]
    char_count: int


class QueryResponse(BaseModel):
    query: str
    response: str
    confidence_score: float
    citations: List[Citation]
    duration: float
    revision_count: int


class HealthResponse(BaseModel):
    status: str
    version: str
    faiss_vectors: int
    documents_count: int
    uptime: float


class StatsResponse(BaseModel):
    total_queries: int
    avg_response_time: float
    avg_confidence: float
    documents_indexed: int

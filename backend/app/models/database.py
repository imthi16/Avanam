import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Document(SQLModel, table=True):
    """Uploaded document metadata."""

    __tablename__ = "documents"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    upload_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    status: str = Field(default="indexed")


class QueryHistory(SQLModel, table=True):
    """Record of each RAG pipeline query."""

    __tablename__ = "query_history"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    query: str
    response: str
    confidence_score: Optional[float] = None
    total_duration: Optional[float] = None
    revision_count: int = Field(default=0)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    agent_runs: List["AgentRun"] = Relationship(back_populates="query_history")


class AgentRun(SQLModel, table=True):
    """Telemetry record for each agent step within a pipeline run."""

    __tablename__ = "agent_runs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    query_history_id: str = Field(foreign_key="query_history.id")
    agent_name: str
    status: str
    duration_ms: Optional[float] = None
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    query_history: Optional[QueryHistory] = Relationship(back_populates="agent_runs")

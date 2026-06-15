from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from app.core.database import get_db
from app.core.redis import cache_get, cache_set
from app.models.schemas import HealthResponse, StatsResponse
from app.models.database import Document, QueryHistory
from app.services.vectorstore_service import vector_store_service
import time

router = APIRouter()
start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    # Try cache first
    cached = await cache_get("avanam:health")
    if cached:
        return HealthResponse(**cached)

    # Get doc count
    result = await db.execute(select(func.count(Document.id)))
    doc_count = result.scalar() or 0

    # Get FAISS stats
    vs_stats = vector_store_service.get_stats()

    response = HealthResponse(
        status="healthy",
        version="1.0.0",
        faiss_vectors=vs_stats["vector_count"],
        documents_count=doc_count,
        uptime=time.time() - start_time
    )

    # Cache for 30 seconds
    await cache_set("avanam:health", response.model_dump(), ttl_seconds=30)
    return response


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Try cache first
    cached = await cache_get("avanam:stats")
    if cached:
        return StatsResponse(**cached)

    result = await db.execute(select(func.count(Document.id)))
    doc_count = result.scalar() or 0

    qh_result = await db.execute(select(
        func.count(QueryHistory.id),
        func.avg(QueryHistory.total_duration),
        func.avg(QueryHistory.confidence_score)
    ))
    row = qh_result.first()

    response = StatsResponse(
        total_queries=row[0] or 0,
        avg_response_time=row[1] or 0.0,
        avg_confidence=row[2] or 0.0,
        documents_indexed=doc_count
    )

    # Cache for 30 seconds
    await cache_set("avanam:stats", response.model_dump(), ttl_seconds=30)
    return response

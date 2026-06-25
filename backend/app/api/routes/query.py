import asyncio
from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse
from app.core.database import get_db, async_session_factory
from app.models.schemas import QueryRequest
from app.models.database import QueryHistory, AgentRun
from app.agents.pipeline import run_pipeline
from app.core.event_bus import EventBus
from sqlmodel import select

router = APIRouter()


@router.post("")
async def submit_query(request: Request, body: QueryRequest):
    event_bus = EventBus()

    async def background_task():
        # Wait for the SSE client to connect and subscribe to Redis
        await event_bus.wait_for_subscriber()

        # Run pipeline
        final_state = await run_pipeline(body.query, event_bus)

        # Save to DB
        if final_state:
            async with async_session_factory() as db:
                qh = QueryHistory(
                    query=body.query,
                    response=final_state.get("final_response", ""),
                    confidence_score=final_state.get("confidence_score", 0.0),
                    revision_count=final_state.get("revision_count", 0),
                    total_duration=0,  # Should be calculated
                )
                db.add(qh)
                await db.commit()
                await db.refresh(qh)

                for event in final_state.get("events", []):
                    if event.get("status") in ["complete", "error", "revision"]:
                        ar = AgentRun(
                            query_history_id=qh.id,
                            agent_name=event.get("agent", "unknown"),
                            status=event.get("status", "unknown"),
                            duration_ms=0,
                            output_summary=str(event.get("data", {})),
                        )
                        db.add(ar)
                await db.commit()

    # Start the pipeline in the background
    asyncio.create_task(background_task())

    return EventSourceResponse(event_bus.subscribe())


@router.get("/history")
async def get_query_history(db=Depends(get_db)):
    result = await db.execute(
        select(QueryHistory).order_by(QueryHistory.created_at.desc())
    )
    return result.scalars().all()

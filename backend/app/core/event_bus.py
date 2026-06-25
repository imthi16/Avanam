import asyncio
import json
from typing import AsyncGenerator, Optional
import redis.asyncio as redis
from app.core.redis import get_redis
from app.core.logger import get_logger

logger = get_logger(__name__)


class EventBus:
    """SSE event bus that uses Redis Pub/Sub when available, falls back to asyncio.Queue."""

    def __init__(self, channel: Optional[str] = None):
        self._channel = channel or f"avanam:events:{id(self)}"
        self._queue: Optional[asyncio.Queue] = None
        self._redis: Optional[redis.Redis] = None

        # Check if Redis is available
        self._redis = get_redis()
        if self._redis is None:
            # Fallback to in-memory queue
            self._queue = asyncio.Queue()

        self._subscribed = asyncio.Event()

    async def wait_for_subscriber(self, timeout=5.0):
        try:
            await asyncio.wait_for(self._subscribed.wait(), timeout=timeout)
        except asyncio.TimeoutError:
            pass

    async def emit(self, event: dict):
        """Publish an event to subscribers."""
        event_json = json.dumps(event)

        if self._redis is not None:
            try:
                await self._redis.publish(self._channel, event_json)
                return
            except Exception as e:
                logger.warning(
                    "Redis publish failed, using queue fallback", error=str(e)
                )
                if self._queue is None:
                    self._queue = asyncio.Queue()

        # Fallback to in-memory queue
        if self._queue is not None:
            await self._queue.put(event)

    async def subscribe(self) -> AsyncGenerator[str, None]:
        """Subscribe to events. Yields SSE-formatted strings."""
        if self._redis is not None:
            try:
                pubsub = self._redis.pubsub()
                await pubsub.subscribe(self._channel)
                self._subscribed.set()

                try:
                    async for message in pubsub.listen():
                        if message["type"] == "message":
                            data = message["data"]
                            yield data

                            # Check for terminal events
                            try:
                                event = json.loads(data)
                                if event.get("event") == "pipeline_complete" or (
                                    event.get("agent") == "pipeline"
                                    and event.get("status") in ["complete", "error"]
                                ):
                                    break
                            except (json.JSONDecodeError, KeyError):
                                pass
                finally:
                    await pubsub.unsubscribe(self._channel)
                    await pubsub.aclose()
                return
            except Exception as e:
                logger.warning(
                    "Redis subscribe failed, using queue fallback", error=str(e)
                )
                if self._queue is None:
                    self._queue = asyncio.Queue()

        # Fallback to in-memory queue
        if self._queue is not None:
            self._subscribed.set()
            while True:
                event = await self._queue.get()
                yield json.dumps(event)
                if event.get("event") == "pipeline_complete" or (
                    event.get("agent") == "pipeline"
                    and event.get("status") in ["complete", "error"]
                ):
                    break

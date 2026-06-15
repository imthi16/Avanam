import json
from typing import Optional
import redis.asyncio as redis
from app.config import get_settings
from app.core.logger import get_logger

logger = get_logger(__name__)

_redis_pool: Optional[redis.Redis] = None


async def init_redis() -> None:
    """Initialize the Redis connection pool. Call during app startup."""
    global _redis_pool
    settings = get_settings()
    try:
        _redis_pool = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
        )
        # Verify connection
        await _redis_pool.ping()
        logger.info("Redis connected", url=settings.REDIS_URL)
    except Exception as e:
        logger.warning("Redis unavailable, falling back to in-memory", error=str(e))
        _redis_pool = None


async def close_redis() -> None:
    """Close the Redis connection pool. Call during app shutdown."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
        logger.info("Redis connection closed")


def get_redis() -> Optional[redis.Redis]:
    """Get the Redis client instance. Returns None if Redis is unavailable."""
    return _redis_pool


async def cache_get(key: str) -> Optional[dict]:
    """Get a cached JSON value by key. Returns None on miss or if Redis is down."""
    if _redis_pool is None:
        return None
    try:
        data = await _redis_pool.get(key)
        if data is not None:
            return json.loads(data)
    except Exception:
        pass
    return None


async def cache_set(key: str, value: dict, ttl_seconds: int = 30) -> None:
    """Cache a JSON value with a TTL. Silently fails if Redis is down."""
    if _redis_pool is None:
        return
    try:
        await _redis_pool.set(key, json.dumps(value), ex=ttl_seconds)
    except Exception:
        pass

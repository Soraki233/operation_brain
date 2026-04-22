import redis.asyncio as redis

from core.config import config


redis_client = redis.from_url(config.db.REDIS_URL, decode_responses=True)

import hashlib
import json
import logging

from redis.exceptions import RedisError

from app.config import CACHE_TTL_SECONDS
from infrastructure.redis_client import redis_client


logger = logging.getLogger(__name__)


class CacheService:
    """Small best-effort Redis cache for completed assistant answers."""

    @staticmethod
    def create_key(
        question: str,
        route: str,
        user_id: str | None,
        document_ids: list[str] | None,
    ) -> str:
        payload = json.dumps(
            {
                "version": 1,
                "question": question.strip(),
                "route": route,
                "user_id": user_id,
                "document_ids": sorted(document_ids or []),
            },
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"research-agent:answer:v1:{digest}"

    @staticmethod
    def get(key: str) -> dict[str, str] | None:
        try:
            cached = redis_client.get(key)
        except RedisError:
            logger.warning("Redis cache read failed; continuing without a cached answer")
            return None

        if not cached:
            return None

        try:
            value = json.loads(cached)
        except (TypeError, json.JSONDecodeError):
            return None

        answer = value.get("answer") if isinstance(value, dict) else None
        return {"answer": answer} if isinstance(answer, str) else None

    @staticmethod
    def set(key: str, answer: str) -> None:
        try:
            redis_client.setex(
                key,
                CACHE_TTL_SECONDS,
                json.dumps({"answer": answer}, ensure_ascii=False),
            )
        except RedisError:
            logger.warning("Redis cache write failed; the assistant response is unaffected")
    
    @staticmethod
    def delete(key: str):
        redis_client.delete(key)
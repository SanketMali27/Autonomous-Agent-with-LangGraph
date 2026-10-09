from datetime import datetime, timedelta, timezone
from uuid import uuid4

from qdrant_client.models import PointStruct

from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager


class SemanticCacheService:
    COLLECTION = "semantic_cache"

    TTL_SECONDS = 6 * 60 * 60
    SIMILARITY_THRESHOLD = 0.80

    def __init__(
        self,
        embedding_model: EmbeddingModel,
        qdrant_manager: QdrantManager,
    ):
        self.embeddings = embedding_model
        self.qdrant = qdrant_manager

        self.qdrant.create_collection(
            collection_name=self.COLLECTION,
            vector_size=self.embeddings.dimension,
        )

    def search(self, question: str, user_id: str, route: str):
        print("🔎 Semantic search:", question)

        vector = self.embeddings.embed([question])[0]

        points = self.qdrant.search(
            collection_name=self.COLLECTION,
            query_vector=vector,
            user_id=user_id,
            limit=1,
        )

        print("Qdrant points:", len(points))

        if not points:
            print("❌ No semantic cache points")
            return None

        point = points[0]

        print("Similarity:", point.score)

        payload = point.payload or {}

        print("Cached route:", payload.get("route"))
        print("Requested route:", route)
        print("Expires:", payload.get("expires_at"))

        if point.score < self.SIMILARITY_THRESHOLD:
            print("❌ Similarity below threshold")
            return None

        if payload.get("route") != route:
            print("❌ Route mismatch")
            return None

        expires_at = payload.get("expires_at")

        if not expires_at:
            print("❌ No expiry")
            return None

        expiry = datetime.fromisoformat(expires_at)

        if datetime.now(timezone.utc) >= expiry:
            print("⌛ Cache expired")
            self.delete(point.id)
            return None

        print("✅ SEMANTIC CACHE HIT")

        return payload.get("answer")

    def store(
        self,
        question: str,
        answer: str,
        user_id: str,
        route: str,
    ):
        vector = self.embeddings.embed([question])[0]

        expires_at = (
            datetime.now(timezone.utc)
            + timedelta(seconds=self.TTL_SECONDS)
        ).isoformat()

        point = PointStruct(
            id=str(uuid4()),
            vector=vector,
            payload={
                "question": question,
                "answer": answer,
                "user_id": user_id,
                "route": route,
                "expires_at": expires_at,
            },
        )

        self.qdrant.upsert(
            collection_name=self.COLLECTION,
            points=[point],
        )

    def delete(self, point_id: str):
        self.qdrant.client.delete(
            collection_name=self.COLLECTION,
            points_selector=[point_id],
            
        )
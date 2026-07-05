from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import QDRANT_URL


class QdrantManager:

    def __init__(self):
        self.client = QdrantClient(url=QDRANT_URL)

    def create_collection(self, collection_name: str, vector_size: int):
        collections = self.client.get_collections().collections
        existing = [c.name for c in collections]

        if collection_name in existing:
            return

        self.client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE,
            ),
        )

    def upsert(self, collection_name: str, points: list):
        self.client.upsert(
            collection_name=collection_name,
            points=points,
        )

    def search(self, collection_name: str, query_vector: list[float], limit: int = 5):
        return self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=limit,
        ).points

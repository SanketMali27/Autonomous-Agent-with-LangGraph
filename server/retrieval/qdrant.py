from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, Filter,FieldCondition,MatchValue
from server.app.config import QDRANT_URL
from qdrant_client.models import (Filter,FieldCondition,MatchValue,FilterSelector,)


class QdrantManager:

    def __init__(self):
        self.client = QdrantClient(url=QDRANT_URL)

    def create_collection( self, collection_name: str, vector_size: int,):

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

    def search(
        self,
        collection_name: str,
        query_vector: list[float],
        user_id: str,
        document_id: str | None = None,
        limit: int = 5,
        ):

        conditions = [
            FieldCondition(
                key="user_id",
                match=MatchValue(value=user_id),
            )
        ]

        if document_id is not None:
            conditions.append(
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=document_id),
                )
            )

        query_filter = Filter(must=conditions)

        return self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit,
        ).points
   
    def delete_document(self,collection_name: str,user_id: str,document_id: str,):
        query_filter = Filter(
          must=[
            FieldCondition(
                key="user_id",
                match=MatchValue(value=user_id),
            ),
            FieldCondition(
                key="document_id",
                match=MatchValue(value=document_id),
            ),
          ]
        )

        self.client.delete(
          collection_name=collection_name,
          points_selector=FilterSelector(
             filter=query_filter,
         ),
        wait=True,
       )
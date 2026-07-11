from server.retrieval.embeddings import EmbeddingModel
from server.retrieval.qdrant import QdrantManager
from server.app.config import COLLECTION_NAME 


class HybridSearcher:


    def __init__(self):
        self.COLLECTION_NAME = COLLECTION_NAME
        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()

    def search( self,
    query: str,
    limit: int = 5,
    user_id: str = None,
    document_id:str | None = None):

        query_vector = self.embedding.embed([query])[0]

        results = self.qdrant.search(
            collection_name=self.COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
            user_id=user_id,
            document_id=document_id,

        )

        return [
          {
          **point.payload,
          "score": point.score, } for point in results]
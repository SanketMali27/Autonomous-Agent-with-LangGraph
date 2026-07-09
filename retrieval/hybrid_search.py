from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager


class HybridSearcher:


    def __init__(self):
        self.COLLECTION_NAME = "hisotory_docs"
        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()

    def search(self, query: str, limit: int = 5):

        query_vector = self.embedding.embed([query])[0]

        results = self.qdrant.search(
            collection_name=self.COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
        )

        return [point.payload for point in results]
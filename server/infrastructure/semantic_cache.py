from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager
from retrieval.semantic_cache_service import SemanticCacheService

embedding_model = EmbeddingModel()
qdrant_manager = QdrantManager()

semantic_cache = SemanticCacheService(
    embedding_model=embedding_model,
    qdrant_manager=qdrant_manager,
)


from sentence_transformers import SentenceTransformer


class EmbeddingModel:

    def __init__(self):
        self.model = SentenceTransformer(
            "BAAI/bge-small-en-v1.5"
        )

    @property
    def dimension(self):
        return self.model.get_embedding_dimension()

    def embed(self, texts: list[str]):
        return self.model.encode(
            texts,
            normalize_embeddings=True,
        ).tolist()
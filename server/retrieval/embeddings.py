import hashlib
import logging
import re


logger = logging.getLogger(__name__)
FALLBACK_DIMENSION = 384


class EmbeddingModel:

    def __init__(self):
        self.model = None
        self._dimension = FALLBACK_DIMENSION

        try:
            from sentence_transformers import SentenceTransformer

            self.model = SentenceTransformer("BAAI/bge-small-en-v1.5")
            self._dimension = self.model.get_embedding_dimension()
        except Exception as exc:
            # Torch DLLs can be blocked by Windows Application Control. Keep
            # the API usable with a deterministic local fallback embedding.
            logger.warning(
                "SentenceTransformer unavailable; using fallback embeddings: %s",
                exc,
            )

    @property
    def dimension(self):
        return self._dimension

    def embed(self, texts: list[str]):
        if self.model is not None:
            return self.model.encode(
                texts,
                normalize_embeddings=True,
            ).tolist()

        return [self._fallback_embedding(text) for text in texts]

    @staticmethod
    def _fallback_embedding(text: str) -> list[float]:
        vector = [0.0] * FALLBACK_DIMENSION
        tokens = re.findall(r"\w+", text.lower())

        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % FALLBACK_DIMENSION
            sign = 1.0 if digest[4] % 2 else -1.0
            vector[index] += sign

        norm = sum(value * value for value in vector) ** 0.5
        if norm:
            vector = [value / norm for value in vector]
        return vector

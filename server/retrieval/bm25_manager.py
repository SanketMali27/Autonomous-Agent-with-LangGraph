from rank_bm25 import BM25Okapi


class BM25Manager:

    def __init__(self):
        self.documents = []
        self.metadata = []
        self.bm25 = None

    def build_index(self, chunks):
        """
        chunks:
        [
            {
                "text": "...",
                "user_id": "...",
                "document_id": "..."
            }
        ]
        """

        self.documents = chunks

        tokenized_documents = [
            self._tokenize(chunk["text"])
            for chunk in chunks
        ]

        if not tokenized_documents:
            self.bm25 = None
            return

        self.bm25 = BM25Okapi(tokenized_documents)

    def search(
        self,
        query: str,
        user_id: str,
        document_ids: list[str] | None = None,
        limit: int = 10,
    ):
        if self.bm25 is None:
            return []

        query_tokens = self._tokenize(query)

        scores = self.bm25.get_scores(query_tokens)

        results = []

        for index, score in enumerate(scores):

            chunk = self.documents[index]

            if chunk["user_id"] != user_id:
                continue

            if document_ids:
                if chunk["document_id"] not in document_ids:
                    continue

            results.append(
                {
                    "text": chunk["text"],
                    "score": float(score),
                    "user_id": chunk["user_id"],
                    "document_id": chunk["document_id"],
                    "chunk_id": chunk.get("chunk_id"),
                }
            )

        results.sort(
            key=lambda item: item["score"],
            reverse=True,
        )

        return results[:limit]

    @staticmethod
    def _tokenize(text: str):
        return text.lower().split()


    
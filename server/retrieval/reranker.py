from sentence_transformers import CrossEncoder


class Reranker:

    def __init__(self):
        self.model = CrossEncoder(
            "BAAI/bge-reranker-base"
        )

    def rerank(
        self,
        question: str,
        docs: list[dict],
        top_k: int = 5,
    ):
        if not docs:
            return []

        pairs = [
            (question, doc["text"])
            for doc in docs
        ]

        scores = self.model.predict(pairs)

        ranked = sorted(
            zip(docs, scores),
            key=lambda x: x[1],
            reverse=True,
        )

        results = []

        for doc, score in ranked[:top_k]:
            results.append({
                **doc,
                "rerank_score": float(score),
            })

        return results
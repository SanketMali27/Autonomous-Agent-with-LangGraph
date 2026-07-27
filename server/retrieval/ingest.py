

from pypdf import PdfReader
from qdrant_client.models import PointStruct
from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager
from datetime import datetime
from uuid import uuid5, NAMESPACE_URL
from app.config import COLLECTION_NAME


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

class DocumentIngestor:


    def __init__(self):

        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()
        self.COLLECTION_NAME = COLLECTION_NAME

        self.qdrant.create_collection(
            collection_name=self.COLLECTION_NAME,
            vector_size=self.embedding.dimension,
        )



    def ingest(self, file_path: str, user_id: str, document_id: str, document_name: str):
        reader = PdfReader(file_path)
        chunks = []

        for page_number, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            for text in self._split_text(page_text):
                chunks.append({
                    "text": text,
                    "page": page_number,
                })

        texts = [chunk["text"] for chunk in chunks]
        vectors = self.embedding.embed(texts)

        points = []



        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):

            unique_key = (
                    f"{user_id}:"
                    f"{document_id}:"
                    f"{chunk['page']}:"
                    f"{index}"
                )
            point_id = str(
                uuid5(NAMESPACE_URL, unique_key)
            )

            points.append(
                PointStruct(
                    id=point_id,
                            vector=vector,
                        payload={
                            "text": chunk["text"],
                            "user_id": user_id,
                            "document_id": document_id,
                            "document_name": document_name,
                            "page": chunk["page"],
                            "chunk_index": index,
                            "uploaded_at": datetime.utcnow().isoformat(),
                            "filetype": "pdf",
                        },
                        )
                    )

        self.qdrant.upsert(
            collection_name=self.COLLECTION_NAME,
            points=points,
        )

        return len(chunks)

    @staticmethod
    def _split_text(text: str) -> list[str]:
        text = " ".join(text.split())
        if not text:
            return []

        chunks = []
        start = 0
        while start < len(text):
            end = min(start + CHUNK_SIZE, len(text))
            chunks.append(text[start:end])
            if end == len(text):
                break
            start = max(end - CHUNK_OVERLAP, start + 1)
        return chunks




from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from qdrant_client.models import PointStruct

from server.retrieval.embeddings import EmbeddingModel
from server.retrieval.qdrant import QdrantManager
from datetime import datetime
from uuid import uuid5, NAMESPACE_URL
from qdrant_client.models import PointStruct
from server.app.config import COLLECTION_NAME

class DocumentIngestor:


    def __init__(self):

        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()
        self.COLLECTION_NAME = COLLECTION_NAME

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

        self.qdrant.create_collection(
            collection_name=self.COLLECTION_NAME,
            vector_size=self.embedding.dimension,
        )



    def ingest(self, file_path: str, user_id: str, document_id: str, document_name: str):

        loader = PyPDFLoader(file_path)
        documents = loader.load()

        chunks = self.splitter.split_documents(documents)

        texts = [chunk.page_content for chunk in chunks]
        vectors = self.embedding.embed(texts)

        points = []



        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):

            unique_key = (
                    f"{user_id}:"
                    f"{document_id}:"
                    f"{chunk.metadata.get('page',0)}:"
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
                            "text": chunk.page_content,
                            "user_id": user_id,
                            "document_id": document_id,
                            "document_name": document_name,
                            "page": chunk.metadata.get("page", 0),
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


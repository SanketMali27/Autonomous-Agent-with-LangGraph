from uuid import uuid4

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from qdrant_client.models import PointStruct

from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager


class DocumentIngestor:

    COLLECTION_NAME = "documents"

    def __init__(self):

        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

        self.qdrant.create_collection(
            collection_name=self.COLLECTION_NAME,
            vector_size=self.embedding.dimension,
        )

    def ingest(self, file_path: str):

        loader = PyPDFLoader(file_path)
        documents = loader.load()

        chunks = self.splitter.split_documents(documents)

        texts = [chunk.page_content for chunk in chunks]

        vectors = self.embedding.embed(texts)

        points = []

        for chunk, vector in zip(chunks, vectors):

            points.append(
                PointStruct(
                    id=uuid4().hex,
                    vector=vector,
                    payload={
                        "text": chunk.page_content,
                        "source": file_path,
                        "page": chunk.metadata.get("page", 0),
                    },
                )
            )

        self.qdrant.upsert(
            self.COLLECTION_NAME,
            points,
        )

        print(f"Ingested {len(points)} chunks.")
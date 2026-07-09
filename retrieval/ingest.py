from uuid import uuid4

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from qdrant_client.models import PointStruct

from retrieval.embeddings import EmbeddingModel
from retrieval.qdrant import QdrantManager

from uuid import uuid5, NAMESPACE_URL
from qdrant_client.models import PointStruct
from pathlib import Path

class DocumentIngestor:


    def __init__(self):

        self.embedding = EmbeddingModel()
        self.qdrant = QdrantManager()
        self.COLLECTION_NAME = "hisotory_docs"

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

        source = Path(file_path).name

        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):

            unique_key = f"{source}:{chunk.metadata.get('page', 0)}:{index}"

            point_id = str(
                uuid5(NAMESPACE_URL, unique_key)
            )

            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "text": chunk.page_content,
                        "source": source,
                        "page": chunk.metadata.get("page", 0),
                        "chunk_index": index,
                    },
                )
            )

        self.qdrant.upsert(
            collection_name=self.COLLECTION_NAME,
            points=points,
        )

        return len(chunks)


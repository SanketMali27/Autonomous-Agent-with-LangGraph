from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent.parent / ".env"


load_dotenv(dotenv_path=env_path)

COLLECTION_NAME = "history_docs"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
QDRANT_URL = os.getenv("QDRANT_URL")

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
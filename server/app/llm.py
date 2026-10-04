from langchain_groq import ChatGroq

from app.config import GROQ_API_KEY

# llm = ChatGroq(
#     groq_api_key=GROQ_API_KEY,
#     model="openai/gpt-oss-120b",
#     temperature=0,
# )
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="groq/openai/gpt-oss-120b",
    base_url="http://localhost:8080/v1",
    api_key="dummy",
    temperature=0.2,
)
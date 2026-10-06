from langchain_groq import ChatGroq



# llm = ChatGroq(
#     groq_api_key=GROQ_API_KEY,
#     model="openai/gpt-oss-120b",
#     temperature=0,
# )
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="groq/openai/gpt-oss-120b",
    base_url="http://localhost:8080/v1",
    api_key=os.getenv("BIFROST_VIRTUAL_KEY"),
    temperature=0.2,
)
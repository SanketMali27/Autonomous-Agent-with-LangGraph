from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    question: str
    route: str
    retrieved_docs: list
    answer: str
    messages: Annotated[list, add_messages]

    retrieval_score: str
    retry_count: int
    rewritten_query: str
    critic_score: str
    approved: bool
    document_name: str
    user_id: str
    document_id: str | None
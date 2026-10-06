from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    question: str
    route: str
    retrieved_docs: list
    answer: str
    messages: Annotated[list, add_messages]
    summary: str
    retrieval_score: str
    retry_count: int
    rewritten_query: str
    critic_score: str
    approved: bool
    document_name: str
    document_level_request: bool
    user_id: str
    document_ids: list[str] | None
    cache_key: str | None
    cache_hit: bool
    semantic_cache_hit: bool
    cache_route: str
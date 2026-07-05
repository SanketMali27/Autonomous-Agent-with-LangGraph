from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    question: str
    route: str
    retrieved_docs: list
    answer: str
    messages: Annotated[list, add_messages]
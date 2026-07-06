from app.llm import llm
from graph.state import AgentState


def rewrite_node(state: AgentState):

    prompt = f"""
You are a query rewriter.

Rewrite the user's question so it is easier for a vector database to retrieve relevant documents.

Only return the rewritten query.

Question:
{state["question"]}
"""

    rewritten_query = llm.invoke(prompt).content.strip()

    print("Original :", state["question"])
    print("Rewritten:", rewritten_query)

    state["rewritten_query"] = rewritten_query
    state["question"] = rewritten_query
    state["retry_count"] += 1

    return state
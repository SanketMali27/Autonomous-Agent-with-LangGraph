from app.llm import llm
from graph.state import AgentState
from tools.web_tool import web_search


def web_node(state: AgentState):

    docs = web_search(state["question"])

    context = "\n\n".join(
        d["content"] for d in docs
    )

    prompt = f"""
Use only this information.

Context:
{context}
Question:
{state["question"]}
"""

    response = llm.invoke(prompt)

    state["answer"] = response.content

    return state
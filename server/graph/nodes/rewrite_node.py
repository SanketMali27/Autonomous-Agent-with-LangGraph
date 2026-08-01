from app.llm import llm
from graph.state import AgentState
from services.prompt_builder import REWRITE_PROMPT


def rewrite_node(state: AgentState):

    prompt = REWRITE_PROMPT.format(question=state["question"])

    rewritten_query = llm.invoke(prompt).content
    print("Original :", state["question"])
    print("Rewritten:", rewritten_query)

    state["rewritten_query"] = rewritten_query
    state["question"] = rewritten_query
    state["retry_count"] += 1

    return state

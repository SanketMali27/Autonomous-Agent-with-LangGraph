from pydantic import BaseModel, Field

from app.llm import llm
from graph.state import AgentState


class Route(BaseModel):
    route: str = Field(
        description="Choose one: rag, web, python"
    )


router = llm.with_structured_output(Route)


def supervisor_node(state: AgentState):

    prompt = f"""
    You are a router.
  
    Choose exactly one route:

    python:
    Use for calculations, code execution, CSV processing,
    statistics, and data analysis.

    web:
    Use only when the user explicitly asks for latest,
    current, recent, news, live, or internet information.

    rag:
    Use for all other knowledge questions because uploaded
    documents must be searched before falling back to web.

    Question:
    {state["question"]}
    """

    result = router.invoke(prompt)

    print("Route:", result.route)

    state["route"] = result.route

    return state

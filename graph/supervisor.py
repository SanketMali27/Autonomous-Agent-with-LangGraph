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

Return:
- rag -> questions about uploaded documents
- web -> latest/current/news information
- python -> calculations, CSV, data analysis

Question:
{state["question"]}
"""

    result = router.invoke(prompt)

    state["route"] = result.route

    return state
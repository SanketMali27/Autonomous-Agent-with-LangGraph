from pydantic import BaseModel, Field

from app.llm import llm
from graph.router import rule_based_router
from graph.state import AgentState
from services.prompt_builder import ROUTER_PROMPT


class Route(BaseModel):
    route: str = Field(description="Choose one: rag, web, python, natural, meta")


router = llm.with_structured_output(Route)


def supervisor_node(state: AgentState):
    if state.get("document_ids"):
        state["route"] = "rag"
        return state

   ###  state["route"] = route
      #  return state

    prompt = ROUTER_PROMPT.format(
        conversation=state.get("summary", ""),
        question=state["question"],
    )

    print("Prompt for routing:", prompt)  # Debugging line
    result = router.invoke(prompt)
    state["route"] = result.route
    print("Determined route:", result.route)  # Debugging line
    return state

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
check the question and previous messages and choose the best route for the next node to answer the question.ans also check retrival documents
Return:
- rag -> questions about uploaded documents
- web -> latest/current/news information
- python -> calculations, CSV, data analysis

Question:
{state["question"]}

Rretrieved_docs:
{state["retrieved_docs"]}
Previous messages:

{state['messages']}
"""

    result = router.invoke(prompt)
    print("Route:", result.route)
    print("messages:", state['messages'])
   # print("retrieved_docs:", state['retrieved_docs'])
    state["route"] = result.route

    return state
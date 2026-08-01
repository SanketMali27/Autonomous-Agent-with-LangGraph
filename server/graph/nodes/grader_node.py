from pydantic import BaseModel, Field

from app.llm import llm
from graph.state import AgentState
from services.prompt_builder import GRADER_PROMPT


class RetrievalGrade(BaseModel):
    decision: str = Field(
        description="Either 'relevant' or 'irrelevant'"
    )


grader = llm.with_structured_output(RetrievalGrade)


def grader_node(state: AgentState):
    
    retry_count = state.get("retry_count", 0)

    if retry_count >= 2:
       state["retrieval_score"] = "web"
       return state

    context = "\n\n".join(
        doc["text"] for doc in state["retrieved_docs"]
    )
   
    prompt = GRADER_PROMPT.format(
        question=state["question"],
        context=context,
    )

    result = grader.invoke(prompt)

    state["retrieval_score"] = result.decision

    return state

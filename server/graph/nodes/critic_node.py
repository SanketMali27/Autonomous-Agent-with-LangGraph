from pydantic import BaseModel, Field

from app.llm import llm
from graph.state import AgentState
from services.prompt_builder import CRITIC_PROMPT


class CriticResult(BaseModel):
    decision: str = Field(
        description="Either 'supported' or 'unsupported'"
    )


critic = llm.with_structured_output(CriticResult)


def critic_node(state: AgentState):

    context = "\n\n".join(
        doc["text"] for doc in state["retrieved_docs"]
    )

    prompt = CRITIC_PROMPT.format(
        question=state["question"],
        context=context,
        answer=state["answer"],
    )

    result = critic.invoke(prompt)

    print("Critic:", result.decision)

    state["critic_score"] = result.decision

    return state

from pydantic import BaseModel, Field

from server.app.llm import llm
from server.graph.state import AgentState


class CriticResult(BaseModel):
    decision: str = Field(
        description="Either 'supported' or 'unsupported'"
    )


critic = llm.with_structured_output(CriticResult)


def critic_node(state: AgentState):

    context = "\n\n".join(
        doc["text"] for doc in state["retrieved_docs"]
    )

    prompt = f"""
You are a fact checker.

Question:
{state["question"]}

Retrieved Context:
{context}

Answer:
{state["answer"]}

Is every important claim in the answer supported by the retrieved context?

Return:
supported
or
unsupported
"""

    result = critic.invoke(prompt)

    print("Critic:", result.decision)

    state["critic_score"] = result.decision

    return state
from pydantic import BaseModel, Field

from server.app.llm import llm
from server.graph.state import AgentState


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
   
    prompt = f"""
You are evaluating retrieved documents.

Question:
{state["question"]}

Retrieved Context:
{context}

If the retrieved context is sufficient to answer the question,
return "relevant".

Otherwise return "irrelevant".
"""

    result = grader.invoke(prompt)

    state["retrieval_score"] = result.decision

    return state
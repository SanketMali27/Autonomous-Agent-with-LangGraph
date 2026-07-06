from app.llm import llm
from graph.state import AgentState
from retrieval.hybrid_search import HybridSearcher

searcher = HybridSearcher()


def rag_node(state: AgentState):

    docs = searcher.search(state["question"])

    context = "\n\n".join(
        doc["text"] for doc in docs
    )
    
    history = "\n".join(
    m.content for m in state["messages"]
      )

    rewrite_prompt = f"""
    Conversation:
    {history}

    Rewrite the latest user question into a standalone question.
    Only return the rewritten question.
    """

    new_query = llm.invoke(rewrite_prompt).content

    docs = searcher.search(new_query)

    prompt = f"""
     Answer using only the provided context.

      Context:
      {context}

      Question:
      {state["question"]}
      """

    response = llm.invoke(prompt)

    state["retrieved_docs"] = docs
   # print("Retrieved docs:", state["retrieved_docs"])
    state["answer"] = response.content

    return state


from app.llm import llm
from graph.state import AgentState
from retrieval.hybrid_search import HybridSearcher

searcher = HybridSearcher()


def rag_node(state: AgentState):

    docs = searcher.search(state["question"])

    context = "\n\n".join(
        doc["text"] for doc in docs
    )

    prompt = f"""
     Answer using only the provided context.

      Context:
      {context}

      Question:
      {state["question"]}
      """

    response = llm.invoke(prompt)

    state["retrieved_docs"] = docs
    state["answer"] = response.content

    return state
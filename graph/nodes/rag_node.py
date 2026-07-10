from app.llm import llm
from graph.state import AgentState
from retrieval.hybrid_search import HybridSearcher

searcher = HybridSearcher()


def rag_node(state: AgentState):

    docs = searcher.search(state["question"], limit=5, document=state.get("document_name"), user_id=state.get("user_id"), document_id=state.get("document_id"))

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
    print("Retrieved docs:", context)
    state["answer"] = response.content

    return state


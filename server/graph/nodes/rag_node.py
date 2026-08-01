from app.llm import llm
from graph.state import AgentState
from retrieval.hybrid_search import HybridSearcher
from services.prompt_builder import RAG_PROMPT

searcher = HybridSearcher()


def rag_node(state: AgentState):

    docs = searcher.search(
        state["question"],
        limit=5,
        user_id=state.get("user_id"),
        document_ids=state.get("document_ids"),
    )

    context = "\n\n".join(
        doc["text"] for doc in docs
    )
    print("USER:", state["user_id"])
    print("DOCUMENT:", state.get("document_ids"))

    for doc in docs:
        print(
        doc.get("document_name"),
        doc.get("document_id"),
        doc.get("score"),
         )

    

    prompt = RAG_PROMPT.format(
        context=context,
        question=state["question"],
    )
    print("Prompt for RAG answer generation:", prompt)  # Debugging line
    response = llm.invoke(prompt)
 

    state["retrieved_docs"] = docs
    print("Retrieved docs:", context)
    state["answer"] = response.content

    return state


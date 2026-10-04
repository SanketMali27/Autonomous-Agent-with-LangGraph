from app.llm import llm
from graph.state import AgentState
from retrieval.hybrid_search import HybridSearcher
from services.prompt_builder import RAG_PROMPT
from app.guardrails.service import GuardrailService
from nemoguardrails.rails.llm.options import RailStatus

searcher = HybridSearcher()
guardrail_service = GuardrailService()

async def rag_node(state: AgentState):

    question = state["question"].lower()

    document_level_request = any(
        phrase in question
        for phrase in [
            "explain this document",
            "explain the document",
            "summarize this document",
            "summarize the document",
            "summarize this pdf",
            "explain this pdf",
            "document summary",
            "give me a summary",
            "give me an overview",
            "what is this document about",
        ]
    )

    state["document_level_request"] = document_level_request
    
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

    allowed, reason = await guardrail_service.check_retrieved_context(context)

    if not allowed:
        state["retrieved_docs"] = []
        state["answer"] = (
            "The retrieved document content was blocked because "
            "it may contain unsafe instructions."
        )
        return state

        
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


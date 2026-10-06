from graph.state import AgentState
from services.cache_service import CacheService


def cache_check_node(state: AgentState):

    key = CacheService.create_key(
        question=state["question"],
        route=state["route"],
        user_id=state.get("user_id"),
        document_ids=state.get("document_ids"),
    )

    print("🔑 CACHE KEY:", key)

    cached = CacheService.get(key)

    print("💾 CACHE RESULT:", cached)

    state["cache_key"] = key

    if cached:
        print("✅ CACHE HIT")
        state["answer"] = cached["answer"]
        state["cache_hit"] = True
    else:
        print("❌ CACHE MISS")
        state["cache_hit"] = False

    return state

def cache_store_node(state: AgentState):

    if (
        not state.get("cache_hit")
        and state.get("answer")
        and state.get("cache_key")
    ):
        CacheService.set(
            state["cache_key"],
            state["answer"],
        )

    return state
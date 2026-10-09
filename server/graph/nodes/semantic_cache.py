from graph.router import rule_based_router
from infrastructure.semantic_cache import semantic_cache

def semantic_cache_check_node(state):
    question = state["question"]

    route = rule_based_router(question)

    print("🧠 SEMANTIC CACHE")
    print("Question:", question)
    print("Rule route:", route)

    state["cache_route"] = route

    if route != "natural":
        print("⏭️ Skipping semantic cache")
        state["semantic_cache_hit"] = False
        return state

    answer = semantic_cache.search(
        question=question,
        user_id=state["user_id"],
        route=route,
    )

    print("Semantic result:", "HIT" if answer else "MISS")

    if answer:
        state["answer"] = answer
        state["semantic_cache_hit"] = True
    else:
        state["semantic_cache_hit"] = False

    return state


def semantic_cache_store_node(state):
    route = state.get("route")

    if route != "natural":
        return state

    answer = state.get("answer")

    if not answer:
        return state

    semantic_cache.store(
        question=state["question"],
        answer=answer,
        user_id=state["user_id"],
        route=route,
    )

    return state
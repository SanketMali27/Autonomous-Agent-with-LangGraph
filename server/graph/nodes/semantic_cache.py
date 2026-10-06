from graph.router import rule_based_router
from infrastructure.semantic_cache import semantic_cache


def semantic_cache_check_node(state):
    question = state["question"]

    route = rule_based_router(question)

    state["cache_route"] = route

    # Semantic cache is currently only for natural queries.
    if route != "natural":
        state["semantic_cache_hit"] = False
        return state

    answer = semantic_cache.search(
        question=question,
        user_id=state["user_id"],
        route=route,
    )

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
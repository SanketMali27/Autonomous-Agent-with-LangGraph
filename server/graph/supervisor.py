import json
import logging
import re

from app.llm import llm
from graph.router import rule_based_router
from graph.state import AgentState
from services.prompt_builder import ROUTER_PROMPT


logger = logging.getLogger(__name__)
VALID_ROUTES = {"rag", "web", "python", "natural", "meta"}


def _route_from_response(response: object) -> str:
    """Extract a route from a normal provider response.

    The router deliberately uses a plain model call. Some Groq models emulate
    structured output by issuing a JSON tool call named ``json``, which the
    API rejects when no such tool is registered.
    """
    content = getattr(response, "content", response)
    if isinstance(content, dict):
        candidate = content.get("route")
        if isinstance(candidate, str) and candidate.lower() in VALID_ROUTES:
            return candidate.lower()

    text = str(content).strip()
    text = re.sub(
        r"^```(?:json|text)?\s*|\s*```$",
        "",
        text,
        flags=re.IGNORECASE,
    )

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            candidate = parsed.get("route")
            if isinstance(candidate, str) and candidate.lower() in VALID_ROUTES:
                return candidate.lower()
    except (TypeError, ValueError):
        pass

    match = re.search(r"\b(rag|web|python|natural|meta)\b", text.lower())
    return match.group(1) if match else "natural"


def supervisor_node(state: AgentState):
    if state.get("document_ids"):
        state["route"] = "rag"
        return state

    rule_route = rule_based_router(state["question"])
    if rule_route:
        state["route"] = rule_route
        return state

    prompt = ROUTER_PROMPT.format(
        conversation=state.get("summary", ""),
        question=state["question"],
    )

    try:
        result = llm.invoke(prompt)
        state["route"] = _route_from_response(result)
    except Exception:
        logger.exception("Route classification failed; using natural route")
        state["route"] = "natural"

    return state

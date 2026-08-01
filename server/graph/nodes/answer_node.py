import logging

from app.llm import llm
from graph.state import AgentState
from services.prompt_builder import NATURAL_PROMPT


logger = logging.getLogger(__name__)


def answer_node(state: AgentState):
    prompt = NATURAL_PROMPT.format(
        conversation=state.get("messages", []),
        question=state["question"],
    )
    print("Prompt for answer generation:", prompt)  # Debugging line
    try:
        result = llm.invoke(prompt)
        content = getattr(result, "content", result)
        state["answer"] = str(content).strip() or (
            "I could not generate an answer for that message."
        )
    except Exception:
        logger.exception("Natural-language answer generation failed")
        state["answer"] = (
            "I could not generate an answer right now. "
            "Please try again in a moment."
        )

    return state

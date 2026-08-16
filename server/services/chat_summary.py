from langchain_core.messages import HumanMessage

from app.llm import llm
from services.prompt_builder import SUMMARY_PROMPT
from langsmith import traceable

@traceable(
    name="conversation_summary",
    run_type="chain",
)
def generate_summary(old_summary: str, recent_messages: list) -> str:
    history = "\n".join(
        f"{'User' if message.role == 'user' else 'Assistant'}: {message.content}"
        for message in recent_messages
    )
    response = llm.invoke(
        [HumanMessage(content=SUMMARY_PROMPT.format(
            summary=old_summary,
            history=history,
        ))]
    )
    return str(getattr(response, "content", response)).strip()

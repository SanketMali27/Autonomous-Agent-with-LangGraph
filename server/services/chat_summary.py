from langchain_core.messages import HumanMessage

from services.prompt_builder import build_messages
from app.llm import llm   # <-- import your LLM instance


SUMMARY_PROMPT = """
You are a conversation summarizer.

Your job is to update the previous conversation summary.

Rules:
- Preserve important facts.
- Preserve user preferences.
- Preserve project progress.
- Remove repetition.
- Keep the summary concise.
- Maximum 250 words.

Return ONLY the updated summary.
"""


def generate_summary(
    old_summary: str,
    recent_messages: list,
) -> str:
    """
    Generates a new conversation summary.
    """

    history = ""

    for msg in recent_messages:

        role = "User" if msg.role == "user" else "Assistant"

        history += f"{role}: {msg.content}\n"

    prompt = f"""
Previous Summary:

{old_summary}

----------------------------------

Recent Conversation:

{history}

----------------------------------

Update the summary.
"""

    response = llm.invoke(
        [
            HumanMessage(
                content=SUMMARY_PROMPT + "\n\n" + prompt
            )
        ]
    )

    return response.content.strip()
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
)

from database.chat_message import ChatMessage


SYSTEM_PROMPT = """
   Use the conversation summary as long-term memory.

     Use the recent conversation as short-term memory.

    Always answer the current user question using the available context.

     If the summary conflicts with the recent conversation,
      prefer the recent conversation.


"""


def build_messages(
    summary: str,
    recent_messages: list[ChatMessage],
    current_question: str,
):
    messages = []

    # System Prompt
    messages.append(
        SystemMessage(content=SYSTEM_PROMPT)
    )

    # Conversation Summary
    if summary.strip():
        messages.append(
            SystemMessage(
                    content=f"""
    Conversation Summary:

    {summary}
    """
                )
            )

        # Last N Messages
    for msg in recent_messages:

            if msg.role == "user":
                messages.append(
                    HumanMessage(content=msg.content)
                )

            else:
                messages.append(
                    AIMessage(content=msg.content)
                )

        # Current Question
    messages.append(
            HumanMessage(content=current_question)
        )

    return messages
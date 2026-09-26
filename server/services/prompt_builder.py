from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
)

from database.chat_message import ChatMessage


ROUTER_PROMPT = """Route the user's latest request to exactly one label: rag, web, python, natural, or meta.

python: explicit code generation/execution, calculations, statistics, CSV or data analysis.
web: explicit latest, current, recent, news, live, or internet requests.
rag: questions requiring the content of uploaded documents.
meta: questions about this app, uploaded files, or session state.
natural: greetings, explanations, project or resume discussion, programming concepts, and follow-ups.

Use the latest request as the primary signal. Return only one route label.

Conversation Summary:
{conversation}

Latest request:
{question}
"""

NATURAL_PROMPT = """Answer only the user's latest question.
Use the conversation as context, prefer recent messages over older ones, and do not repeat greetings.
Be concise, direct, and do not invent facts.

Conversation:
{conversation}

Question:
{question}
"""

RAG_PROMPT = """Answer the question using only the retrieved document context.
If the context is insufficient, say so clearly. Do not invent citations or facts.

Context:
{context}

Question:
{question}
"""

WEB_PROMPT = """Answer using only the web context below. If it does not support an answer, say so.

Web context:
{context}

Question:
{question}
"""

PYTHON_PROMPT = """Generate only executable Python code for the request.
Do not use markdown, explanations, network access, file deletion, or unrelated code.

Request:
{question}
"""

GRADER_PROMPT = """Decide whether the retrieved context is sufficient to answer the question.
Return only a structured decision: relevant or irrelevant.

Question:
{question}

Context:
{context}
"""

CRITIC_PROMPT = """Check whether every important claim in the answer is supported by the retrieved context.
Return only a structured decision: supported or unsupported.

Question:
{question}

Context:
{context}

Answer:
{answer}
"""

REWRITE_PROMPT = """Rewrite the question into a concise search query for the document vector store.
Return only the rewritten query.

Question:
{question}
"""

SUMMARY_PROMPT = """Update the conversation summary using the previous summary and recent messages.
Preserve important facts, preferences, decisions, and progress; remove repetition.
Return only a concise summary of at most 250 words.

Previous summary:
{summary}

Recent messages:
{history}
"""


SYSTEM_PROMPT = """
Use the conversation summary as long-term memory and recent messages as short-term memory.
Prefer recent messages when they conflict. Answer the latest user question directly.
"""


def build_messages(
    summary: str,
    recent_messages: list[ChatMessage],
    current_question: str,
):
    messages = [
        SystemMessage(content=SYSTEM_PROMPT)
    ]

    if summary.strip():
        messages.append(
            SystemMessage(
                content=f"Conversation Summary:\n{summary}"
            )
        )

    for msg in recent_messages:
        if msg.role == "user":
            messages.append(
                HumanMessage(content=msg.content)
            )
        else:
            messages.append(
                AIMessage(content=msg.content)
            )

    messages.append(
        HumanMessage(content=current_question)
    )

    return messages

from services.document_service import get_user_documents
from graph.state import AgentState
from database.db import SessionLocal


def meta_node(state: AgentState):

    user_id = state["user_id"]

    db = SessionLocal()

    try:
        docs = get_user_documents(db, user_id)

        if not docs:
            state["answer"] = (
                "You haven't uploaded any documents yet."
            )
            return state

        lines = []

        for d in docs:
            lines.append(f"- {d.document_name}")

        state["answer"] = (
            "Here are your uploaded documents:\n\n"
            + "\n".join(lines)
        )

        return state

    finally:
        db.close()
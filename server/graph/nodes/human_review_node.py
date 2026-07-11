from langgraph.types import interrupt


def human_review_node(state):

    decision = interrupt(
        {
            "question": state["question"],
            "answer": state["answer"],
            "message": "Approve this action?"
        }
    )

    state["approved"] = decision

    return state
from app.llm import llm

def answer_node(state):
    prompt = f"""

    Give answer of the following question in a friendly manner.
    Ask them how you can help them  according to the question.

    {state["messages"]}
    Question:
    {state["question"]}
 """
    print("Prompt for natural node :",prompt)
    result= llm.invoke(prompt)
    print("Previous conversation:", state["messages"])
    state["answer"] = result.content
    return state
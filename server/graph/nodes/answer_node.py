from app.llm import llm

def answer_node(state):
    prompt = f"""
    Give answer of the following question in a friendly manner.
    Ask them how you can help them  according to the question.

    Question:
    {state["question"]}
 """
    
    result= llm.invoke(prompt)
    state["answer"] = result.content
    return state
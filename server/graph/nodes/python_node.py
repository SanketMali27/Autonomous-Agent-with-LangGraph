from app.llm import llm
from graph.state import AgentState
from tools.python_tool import PythonExecutor

executor = PythonExecutor()


def python_node(state: AgentState):

    prompt = f"""
Generate only executable Python code.

Question:
{state["question"]}

Do not use markdown.
Do not explain.
"""

    code = llm.invoke(prompt).content
    print(f"Generated code:\n{code}")
    code = code.replace("```python", "").replace("```", "").strip()
    print(f"Executing code:\n{code}")
    result = executor.run(code)

    state["answer"] = result["output"]

    return state
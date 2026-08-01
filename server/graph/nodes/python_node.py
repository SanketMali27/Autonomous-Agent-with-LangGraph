from app.llm import llm
from graph.state import AgentState
from tools.python_tool import PythonExecutor
from services.prompt_builder import PYTHON_PROMPT

executor = PythonExecutor()


def python_node(state: AgentState):

    prompt = PYTHON_PROMPT.format(question=state["question"])
    print("Prompt for Python code generation:", prompt)  # Debugging line
    try:
        response = llm.invoke(prompt)
        code = getattr(response, "content", "")
        if not isinstance(code, str):
            code = str(code)
        code = code.replace("```python", "").replace("```", "").strip()

        if not code:
            state["answer"] = "Python execution could not start because no code was generated."
            return state

        result = executor.run(code)
        output = str(result.get("output") or "").strip()
        if result.get("success"):
            state["answer"] = output or "Python executed successfully with no printed output."
        else:
            state["answer"] = f"Python execution failed: {output or 'Unknown execution error.'}"
    except Exception as exc:
        state["answer"] = f"Python execution could not be completed: {str(exc)[:1000]}"

    return state

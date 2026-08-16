import io
from contextlib import redirect_stdout
from langsmith import traceable

@traceable(
    name="python_executor",
    run_type="tool",
    tags=["python"],
)
class PythonExecutor:

    def run(self, code: str):

        output = io.StringIO()

        try:
            with redirect_stdout(output):
                exec(code, {})

            return {
                "success": True,
                "output": output.getvalue(),
            }

        except BaseException as e:
            return {
                "success": False,
                "output": f"{type(e).__name__}: {e}",
            }

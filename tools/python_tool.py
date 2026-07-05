import io
from contextlib import redirect_stdout


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

        except Exception as e:
            return {
                "success": False,
                "output": str(e),
            }
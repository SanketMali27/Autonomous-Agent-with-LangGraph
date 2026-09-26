import ast

from langsmith import traceable
import subprocess
import tempfile
from pathlib import Path



@traceable(
    name="python_executor",
    run_type="tool",
    tags=["python", "sandbox"],
)
class PythonExecutor:

    IMAGE = "python:3.12-slim"
    TIMEOUT = 10

    def run(self, code: str):

        with tempfile.TemporaryDirectory() as temp_dir:

            code_file = Path(temp_dir) / "main.py"
            code_file.write_text(code, encoding="utf-8")

            command = [
                "docker",
                "run",
                "--rm",

                # Security restrictions
                "--network", "none",
                "--memory", "256m",
                "--cpus", "0.5",
                "--pids-limit", "64",

                # Read-only container filesystem
                "--read-only",

                # Temporary writable directory
                "--tmpfs", "/tmp",

                # Run as non-root
                "--user", "1000:1000",

                # Mount only our Python file
                "-v",
                f"{code_file}:/app/main.py:ro",

                self.IMAGE,
                "python",
                "/app/main.py",
            ]

            try:
                result = subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    timeout=self.TIMEOUT,
                )

                output = result.stdout.strip()
                error = result.stderr.strip()

                if result.returncode == 0:
                    return {
                        "success": True,
                        "output": output,
                    }

                return {
                    "success": False,
                    "output": error or output or "Python execution failed.",
                }

            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "output": "Python execution timed out.",
                }

            except Exception as exc:
                return {
                    "success": False,
                    "output": f"Executor error: {exc}",
                }

BLOCKED_IMPORTS = {
    "os",
    "subprocess",
    "shutil",
    "socket",
    "requests",
    "httpx",
    "urllib",
    "pathlib",
}

BLOCKED_FUNCTIONS = {
    "eval",
    "exec",
    "compile",
    "__import__",
    "open",
}

@traceable(
    name="validate_code",
    run_type="tool",
    tags=["python"],
)
def validate_code(code: str):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, f"Invalid Python: {e}"

    for node in ast.walk(tree):

        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in BLOCKED_IMPORTS:
                    return False, f"Blocked import: {alias.name}"

        if isinstance(node, ast.ImportFrom):
            if node.module and node.module.split(".")[0] in BLOCKED_IMPORTS:
                return False, f"Blocked import: {node.module}"

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in BLOCKED_FUNCTIONS:
                    return False, f"Blocked function: {node.func.id}"

    return True, "Code is allowed"
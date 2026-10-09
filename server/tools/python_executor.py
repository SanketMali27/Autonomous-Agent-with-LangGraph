import subprocess
import tempfile
from pathlib import Path

from langsmith import traceable
from tools.python_validator import validate_python_code

class PythonExecutor:

    IMAGE = "research-agent-python:1.0"

    TIMEOUT = 10
    MEMORY = "256m"
    CPUS = "0.5"
    PIDS_LIMIT = "64"

    @traceable(
        name="python_executor",
        run_type="tool",
        tags=["python", "sandbox"],
    )
    def run(self, code: str) -> str:
        valid, message = validate_python_code(code)

        if not valid:
            return message
        with tempfile.TemporaryDirectory() as temp_dir:

            code_file = Path(temp_dir) / "main.py"

            code_file.write_text(
                code,
                encoding="utf-8",
            )

            command = [
                "docker",
                "run",
                "--rm",

                # No internet
                "--network",
                "none",

                # Resource limits
                "--memory",
                self.MEMORY,

                "--cpus",
                self.CPUS,

                "--pids-limit",
                self.PIDS_LIMIT,

                # Read-only container filesystem
                "--read-only",

                # Writable temporary directory
                "--tmpfs",
                "/tmp",

                # Non-root user
                "--user",
                "1000:1000",

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

            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "output": "Execution timed out.",
                }

            except Exception as exc:
                return {
                    "success": False,
                    "output": f"Sandbox execution failed: {exc}",
                }

            if result.returncode != 0:
                return {
                    "success": False,
                    "output": result.stderr[-4000:],
                }

            return {
                "success": True,
                "output": result.stdout[-4000:],
            }
import ast


BLOCKED_IMPORTS = {
    "os",
    "subprocess",
    "socket",
    "shutil",
    "sys",
    "ctypes",
    "multiprocessing",
}

BLOCKED_CALLS = {
    "eval",
    "exec",
    "compile",
    "__import__",
}


def validate_python_code(code: str):

    try:
        tree = ast.parse(code)

    except SyntaxError as exc:
        return False, f"Invalid Python syntax: {exc}"

    for node in ast.walk(tree):

        # imports
        if isinstance(node, ast.Import):

            for alias in node.names:

                root_module = alias.name.split(".")[0]

                if root_module in BLOCKED_IMPORTS:
                    return False, (
                        f"Blocked import: {root_module}"
                    )

        if isinstance(node, ast.ImportFrom):

            if node.module:

                root_module = node.module.split(".")[0]

                if root_module in BLOCKED_IMPORTS:
                    return False, (
                        f"Blocked import: {root_module}"
                    )

        # dangerous functions
        if isinstance(node, ast.Call):

            if isinstance(node.func, ast.Name):

                if node.func.id in BLOCKED_CALLS:
                    return False, (
                        f"Blocked function: {node.func.id}"
                    )

    return True, "Code is valid"
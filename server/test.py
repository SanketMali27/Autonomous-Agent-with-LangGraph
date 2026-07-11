from tools.python_tool import PythonExecutor

executor = PythonExecutor()

result = executor.run("""
print(10+20)
""")

print(result)
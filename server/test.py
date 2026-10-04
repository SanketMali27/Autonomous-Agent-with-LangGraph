from app.llm import llm

response = llm.invoke("hii")

print(response.content)
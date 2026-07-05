from graph.builder import build_graph

graph = build_graph()

response = graph.invoke(
    {
        "question": "Print numbers from 1 to 10.",
        "route": "",
        "retrieved_docs": [],
        "answer": "",
    }
)

print(response["answer"])
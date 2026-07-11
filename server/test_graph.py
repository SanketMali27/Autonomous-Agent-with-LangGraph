from server.graph.builder import build_graph
from server.memory.checkpoint import create_memory
from langchain_core.messages import HumanMessage

with create_memory() as memory:

    graph = build_graph(memory)

    config = {
        "configurable": {
            "thread_id": "user-1"
        }
    }

    response = graph.invoke(
        {
            "question": "What is the applicant email id?",
            "route": "",
            "retrieved_docs": [],
            "answer": "",
            "messages": [
                HumanMessage(content="What is the applicant email id?")
            ],
            "retry_count": 0,
            "retrieval_score": "",
            "rewritten_query": "",
            "critic_score": "",
            "approved": False
        },
        config=config,
    )

    print(response)
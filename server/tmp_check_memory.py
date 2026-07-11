from server.graph.builder import build_graph
from server.memory.checkpoint import create_memory
from langchain_core.messages import HumanMessage
import os

if os.path.exists('checkpoints.db'):
    os.remove('checkpoints.db')

with create_memory() as memory:
    graph = build_graph(memory)
    config = {"configurable": {"thread_id": "user-verify"}}

    first = graph.invoke(
        {
            "question": "Who is the applicant?",
            "route": "",
            "retrieved_docs": [],
            "answer": "",
            "messages": [HumanMessage(content="Who is the applicant?")],
        },
        config=config,
    )
    print('first messages', first.get('messages'))
    print('state1', graph.get_state(config).values)

    second = graph.invoke(
        {
            "question": "What is his email?",
            "route": "",
            "retrieved_docs": [],
            "answer": "",
            "messages": [HumanMessage(content="What is his email?")],
        },
        config=config,
    )
    print('second messages', second.get('messages'))
    print('state2', graph.get_state(config).values)

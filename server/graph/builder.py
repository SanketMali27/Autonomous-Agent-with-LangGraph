from graph.supervisor import supervisor_node
from graph.nodes.rag_node import rag_node
from graph.state import AgentState
from langgraph.graph import StateGraph, START, END
from graph.nodes.web_node import web_node
from graph.nodes.python_node import python_node
from graph.nodes.grader_node import grader_node
from graph.nodes.rewrite_node import rewrite_node
from graph.nodes.critic_node import critic_node
from graph.nodes.human_review_node import human_review_node
from graph.nodes.answer_node import answer_node
from graph.nodes.meta_node import meta_node


def build_graph(memory=None):
    graph = StateGraph(AgentState)

    graph.add_node("rag_node", rag_node)
    graph.add_node("web_node", web_node)
    graph.add_node("supervisor_node", supervisor_node)
    graph.add_node("python_node", python_node)
    graph.add_node("grader_node", grader_node)
    graph.add_node("rewrite_node", rewrite_node)
    graph.add_node("critic_node", critic_node)
    graph.add_node("human_review_node", human_review_node)
    graph.add_node("answer_node", answer_node)
    graph.add_node("meta_node",meta_node)


    graph.add_edge(START, "supervisor_node")
    def route_after_supervisor(state):
         print("Branch route:", repr(state["route"]))
         return state["route"]
    
    graph.add_conditional_edges(
        "supervisor_node",
          route_after_supervisor,
        {
            "natural":"answer_node",
            "rag": "rag_node",
            "web": "web_node",
            "python": "python_node",
            "meta":"meta_node",
        },
    )
    
    graph.add_edge("meta_node",END)
    graph.add_edge("answer_node", END)
    graph.add_edge("rag_node", "grader_node")
    graph.add_conditional_edges(
    "grader_node",
    lambda state: state["retrieval_score"],
    {
        "relevant": "critic_node",
        "irrelevant": "rewrite_node",
        "web": "web_node",
    },
)
    graph.add_conditional_edges(
    "critic_node",
    lambda state: state["critic_score"],
    {
        "supported": "human_review_node",
        "unsupported": "rewrite_node",
    }
    )

    graph.add_edge("human_review_node",END)
    graph.add_edge("rewrite_node", "rag_node")
   
    graph.add_edge("web_node", END)
    graph.add_edge("python_node", END)
    
    if memory:
        return graph.compile(checkpointer=memory)

    return graph.compile()

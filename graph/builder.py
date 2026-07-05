from graph.supervisor import supervisor_node
from graph.nodes.rag_node import rag_node
from graph.state import AgentState
from langgraph.graph import StateGraph, START, END
from graph.nodes.web_node import web_node
from graph.nodes.python_node import python_node


def build_graph():
     
     graph = StateGraph(AgentState)

     graph.add_node("rag_node",rag_node)
     graph.add_node("web_node",web_node)
     graph.add_node("supervisor_node",supervisor_node)
     graph.add_node("python_node",python_node)

     graph.add_edge(START,"supervisor_node")
     graph.add_conditional_edges(
       "supervisor_node",
        lambda state: state["route"],
       {
        "rag": "rag_node",
        "web": "web_node",
        "python": "python_node",
        },
     )
     graph.add_edge("rag_node",END)
     
     return graph.compile()

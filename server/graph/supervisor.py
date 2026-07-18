from pydantic import BaseModel, Field

from app.llm import llm
from graph.state import AgentState
from graph.router import rule_based_router

class Route(BaseModel):
    route: str = Field(
        description="Choose one: rag, web, python, natural,meta"
    )


router = llm.with_structured_output(Route)


def supervisor_node(state: AgentState):
    
    # Explicit document selected → always search that document
    if state.get("document_id"):
        print("Document selected → Route: rag")
        state["route"] = "rag"
        return state

    route = rule_based_router(state["question"])

    if route:
      print("Rule Route:", route)
      state["route"] = route
      return state

    prompt = f"""
You are a router. Choose exactly one route for the user's question.

python:
Use for calculations, code execution, CSV processing,
statistics, and data analysis.

web:
Use only when the user explicitly asks for latest,
current, recent, news, live, or internet information.

rag:
Use for knowledge questions that require searching the
CONTENT of uploaded documents (e.g. "what does the contract say
about termination", "summarize chapter 2").

meta:
Use for questions ABOUT the platform/session itself rather than
document content — e.g. "did I upload any document?",
"what files do I have?", "what is the status of my upload?",
"what can you do?", "how do I upload a file?".
This is NOT a knowledge question and NOT a document-content question.

natural:
Use for general conversational questions answerable without
searching documents or the web (e.g. "hii", "who are you?",
"what is your name?").

Examples:
"did i uploaded any document" -> meta
"what documents do i have" -> meta
"is my file still processing" -> meta
"summarize the uploaded pdf" -> rag
"what does section 3 say" -> rag
"latest news on AI" -> web
"calculate the average of this csv" -> python
"hi" -> natural

Question:
{state["question"]}
"""

    result = router.invoke(prompt)

    print("Route:", repr(result.route))
  #  print("Route:", result.route)
    state["route"] = result.route

    return state

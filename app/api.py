from fastapi import FastAPI,UploadFile, File, HTTPException

from graph.builder import build_graph
from memory.checkpoint import create_memory
from app.schemas import ChatRequest, ChatResponse ,ApprovalRequest
from langgraph.types import Command
from langchain_core.messages import HumanMessage
from pathlib import Path
import shutil
from retrieval.ingest import DocumentIngestor


app = FastAPI(
    title="Autonomous Research & Analytics Agent"
)


# Keep SQLite context alive while application runs
memory_context = create_memory()
memory = memory_context.__enter__()

graph = build_graph(memory)


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    result = graph.invoke(
        {
            "question": request.question,
            "route": "",
            "retrieved_docs": [],
            "answer": "",
            "messages": [
                HumanMessage(content=request.question)
            ],
            "retry_count": 0,
            "retrieval_score": "",
            "rewritten_query": "",
            "critic_score": "",
            "approved": False,
        },
        config=config,
    )

    if "__interrupt__" in result:

        interrupt_data = result["__interrupt__"][0].value

        return ChatResponse(
            status="waiting_for_approval",
            answer=result.get("answer"),
            interrupt=interrupt_data,
        )

    return ChatResponse(
        status="completed",
        answer=result.get("answer"),
    )



@app.post("/approve")
def approve(request: ApprovalRequest):

    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    result = graph.invoke(
        Command(resume=request.approved),
        config=config,
    )

    return {
        "status": "completed",
        "approved": request.approved,
        "answer": result.get("answer"),
    }




UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ingestor = DocumentIngestor()


@app.post("/upload")
def upload_document(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks_count = ingestor.ingest(str(file_path))

    return {
        "status": "success",
        "filename": file.filename,
        "chunks_ingested": chunks_count,
    }
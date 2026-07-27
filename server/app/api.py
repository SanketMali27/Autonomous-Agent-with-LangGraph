from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI,UploadFile, File, HTTPException
from retrieval.ingest import DocumentIngestor
from graph.builder import build_graph
from memory.checkpoint import create_memory
from app.schemas import ChatRequest, ChatResponse ,ApprovalRequest
from langgraph.types import Command
from langchain_core.messages import HumanMessage
from pathlib import Path
import shutil
from database.db import get_db
from uuid import uuid4
from fastapi import Depends
from sqlalchemy.orm import Session
from  auth.dependencies import get_current_user
from database.db import get_db
from database.models import Document, User
from services.document_service import get_user_documents
from routers.session_router import router as session_router
from repositories.chat_repository import ChatRepository
from services.chat_service import ChatService


app = FastAPI(
    title="Autonomous Research & Analytics Agent"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Keep SQLite context alive while application runs
memory_context = create_memory()
memory = memory_context.__enter__()

graph = build_graph(memory)

app.include_router(session_router)





UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ingestor = DocumentIngestor()


@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):        
        chat_service = ChatService(ChatRepository(db))
        session = chat_service.get_session(
                session_id=request.session_id,
                user_id=current_user.id,
            )

        if session is None:
          raise HTTPException(
          status_code=404,
          detail="Session not found",
           )
  
        config = {
            "configurable": {
                "thread_id": str(request.session_id)
            }
        }
        chat_service.save_message(
           session_id=request.session_id,
           role="user",
           user_id=current_user.id,
           content=request.question,)
        
        try:
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
                        "user_id": current_user.id,
                        "document_ids": request.document_ids,   
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

                chat_service.save_message(
                                session_id=request.session_id,
                                role="assistant",
                                user_id=current_user.id,
                                content=result.get("answer", "")
                                )
                
                return ChatResponse(
                    status="completed",
                    answer=result.get("answer"),
                )
            
   
        except Exception:
          db.rollback()
          raise
  



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

@app.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported",
        )

    user_id = current_user.id
    document_id = str(uuid4())

    file_path = UPLOAD_DIR / f"{document_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks_count = ingestor.ingest(
        file_path=str(file_path),
        user_id=user_id,
        document_id=document_id,
        document_name=file.filename,
    )

    document = Document(
        id=document_id,
        user_id=user_id,
        document_name=file.filename,
        file_path=str(file_path),
    )

    db.add(document)
    db.commit()

    return {
        "status": "success",
        "document_id": document_id,
        "filename": file.filename,
        "chunks_ingested": chunks_count,
    }

@app.get("/documents")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents=get_user_documents(db,current_user.id)

    return {
        "documents": [
            {
                "document_id": document.id,
                "document_name": document.document_name,
                "uploaded_at": document.uploaded_at,
            }
            for document in documents
        ]
    }

@app.delete("/documents/{document_id}")
def delete_document(document_id: str,db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == user_id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    # Delete vectors from Qdrant
    ingestor.qdrant.delete_document(
        collection_name=ingestor.COLLECTION_NAME,
        user_id=user_id,
        document_id=document_id,
    )

    # Delete local PDF
    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    # Delete PostgreSQL metadata
    db.delete(document)
    db.commit()

    return {
        "status": "success",
        "message": "Document deleted successfully",
        "document_id": document_id,
    }
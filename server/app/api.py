import logging
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langgraph.types import Command
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import Request as FastAPIRequest

from app.errors import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.schemas import ApprovalRequest, ChatRequest, ChatResponse
from auth.dependencies import get_current_user
from database.db import get_db
from database.models import Document, User
from graph.builder import build_graph
from memory.checkpoint import create_memory
from repositories.chat_repository import ChatRepository
from retrieval.ingest import DocumentIngestor
from routers.session_router import router as session_router
from services.chat_service import ChatService
from services.document_service import get_user_documents
from services.prompt_builder import build_messages
from contextlib import asynccontextmanager
from app.guardrails.service import GuardrailService
from nemoguardrails.rails.llm.options import RailStatus



logger = logging.getLogger(__name__)
MAX_UPLOAD_SIZE = 25 * 1024 * 1024

@asynccontextmanager
async def lifespan(app: FastAPI):
    with create_memory() as memory:
        app.state.graph = build_graph(memory)
        app.state.guardrails = GuardrailService()

        yield

app = FastAPI(
    title="Autonomous Research & Analytics Agent",
    lifespan=lifespan,
)

@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    return await http_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return await validation_exception_handler(request, exc)


@app.exception_handler(Exception)
async def handle_unhandled_exception(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    logger.exception("Unhandled API error: %s %s", request.method, request.url.path)
    return await unhandled_exception_handler(request, exc)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Keep one checkpointer alive for the lifetime of the process. This is
# required for approval/resume calls to use the same graph state.

ingestor = DocumentIngestor()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app.include_router(session_router)


def _answer_text(value: object) -> str:
    if value is None:
        return "The assistant did not return an answer."
    if isinstance(value, str):
        return value
    return str(value)


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    http_request: FastAPIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat_service = ChatService(ChatRepository(db))
    requested_session_id = request.session_id

    try:
        guardrails = http_request.app.state.guardrails

        input_result = await guardrails.check_input(request.question)

        if input_result.status == RailStatus.BLOCKED:
            return ChatResponse(
                status="completed",
                answer="I can't help with that request.",
                session_id=requested_session_id,
            )
        session = chat_service.get_session(
            session_id=requested_session_id,
            user_id=current_user.id,
        ) if requested_session_id else None

        if session is None and requested_session_id is not None:
            session = chat_service.create_session(
                user_id=current_user.id,
                title="New Chat",
                session_id=requested_session_id,
            )

        if session is None:
            session = chat_service.create_session(
                user_id=current_user.id,
                title="New Chat",
            )

        if session.title == "New Chat":
            chat_service.update_session_title(
                session_id=session.session_id,
                user_id=current_user.id,
                title=request.question[:50],
            )
             
        summary = chat_service.get_summary(session.session_id, current_user.id)
        recent_messages = chat_service.get_recent_messages(
            session.session_id,
            current_user.id,
        )
        
        messages = build_messages(
            summary=summary,
            recent_messages=recent_messages,
            current_question=request.question,
        )

        config = {
                "configurable": {
                    "thread_id": str(session.session_id),
                },
                "run_name": "chat_request",
                "tags": ["chat"],
                "metadata": {
                    "session_id": str(session.session_id),
                    "user_id": str(current_user.id),
                    "document_count": len(request.document_ids or []),
                },
            }


        result = http_request.app.state.graph.invoke(
            {
                "question": request.question,
                "route": "",
                "retrieved_docs": [],
                "answer": "",
                "messages": messages,
                "summary": summary,
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

        interrupts = result.get("__interrupt__", []) if isinstance(result, dict) else []
        if interrupts:
            return ChatResponse(
                status="waiting_for_approval",
                answer=_answer_text(result.get("answer")),
                session_id=session.session_id,
                interrupt=interrupts[0].value,
            )

        answer = _answer_text(result.get("answer") if isinstance(result, dict) else None)
        output_result = await guardrails.check_output(answer)

        if output_result.status == RailStatus.BLOCKED:
            answer = "I can't provide that response."
        chat_service.save_message(
            session_id=session.session_id,
            role="user",
            user_id=current_user.id,
            content=request.question,
        )
        chat_service.save_message(
            session_id=session.session_id,
            role="assistant",
            user_id=current_user.id,
            content=answer,
        )

        try:
            chat_service.maybe_refresh_summary(session.session_id, current_user.id)
        except Exception:
            # Summary refresh is background-quality work and must not turn a
            # successful assistant response into an API failure.
            logger.exception("Conversation summary refresh failed")

        return ChatResponse(
            status="completed",
            answer=answer,
            session_id=session.session_id,
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Chat request failed for user %s", current_user.id)
        raise HTTPException(
            status_code=503,
            detail="The assistant could not complete this request. Please try again.",
        )


@app.post("/approve", response_model=ChatResponse)
def approve(
    request: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat_service = ChatService(ChatRepository(db))
    session_id = request.thread_id
    session = chat_service.get_session(session_id, current_user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    try:
        result = graph.invoke(
            Command(resume=request.approved),
            config={"configurable": {"thread_id": str(session_id)}},
        )
        interrupts = result.get("__interrupt__", []) if isinstance(result, dict) else []
        if interrupts:
            return ChatResponse(
                status="waiting_for_approval",
                answer=_answer_text(result.get("answer")),
                session_id=session_id,
                interrupt=interrupts[0].value,
            )

        answer = _answer_text(result.get("answer") if isinstance(result, dict) else None)
        chat_service.save_message(
            session_id=session_id,
            role="assistant",
            user_id=current_user.id,
            content=answer,
        )
        return ChatResponse(
            status="completed",
            answer=answer,
            session_id=session_id,
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Approval request failed for user %s", current_user.id)
        raise HTTPException(
            status_code=503,
            detail="The approval could not be completed. Please try again.",
        )


@app.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = Path(file.filename or "").name
    if not filename or Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    document_id = str(uuid4())
    file_path = UPLOAD_DIR / f"{document_id}_{filename}"

    try:
        size = 0
        with file_path.open("wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(status_code=413, detail="PDF must be smaller than 25 MB")
                buffer.write(chunk)

        chunks_count = ingestor.ingest(
            file_path=str(file_path),
            user_id=current_user.id,
            document_id=document_id,
            document_name=filename,
        )
        if not chunks_count:
            raise HTTPException(status_code=422, detail="The PDF does not contain readable text")

        db.add(Document(
            id=document_id,
            user_id=current_user.id,
            document_name=filename,
            file_path=str(file_path),
        ))
        db.commit()
        return {
            "status": "success",
            "document_id": document_id,
            "filename": filename,
            "chunks_ingested": chunks_count,
        }
    except HTTPException:
        db.rollback()
        file_path.unlink(missing_ok=True)
        try:
            ingestor.qdrant.delete_document(
                collection_name=ingestor.COLLECTION_NAME,
                user_id=current_user.id,
                document_id=document_id,
            )
        except Exception:
            logger.exception("Upload cleanup failed for document %s", document_id)
        raise
    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        try:
            ingestor.qdrant.delete_document(
                collection_name=ingestor.COLLECTION_NAME,
                user_id=current_user.id,
                document_id=document_id,
            )
        except Exception:
            logger.exception("Upload cleanup failed for document %s", document_id)
        logger.exception("Document upload failed for user %s", current_user.id)
        raise HTTPException(
            status_code=422,
            detail="The PDF could not be processed. Please upload a readable PDF and try again.",
        )


@app.get("/documents")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = get_user_documents(db, current_user.id)
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
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        ingestor.qdrant.delete_document(
            collection_name=ingestor.COLLECTION_NAME,
            user_id=current_user.id,
            document_id=document_id,
        )
        Path(document.file_path).unlink(missing_ok=True)
        db.delete(document)
        db.commit()
        return {
            "status": "success",
            "message": "Document deleted successfully",
            "document_id": document_id,
        }
    except Exception:
        db.rollback()
        logger.exception("Document deletion failed for user %s", current_user.id)
        raise HTTPException(
            status_code=503,
            detail="The document could not be deleted completely. Please try again.",
        )

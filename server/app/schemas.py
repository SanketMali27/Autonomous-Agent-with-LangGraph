from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    thread_id: str
    document_id: str | None = None


class ChatResponse(BaseModel):
    answer: str | None = None
    status: str
    interrupt: dict | None = None

class ApprovalRequest(BaseModel):
    thread_id: str
    approved: bool    
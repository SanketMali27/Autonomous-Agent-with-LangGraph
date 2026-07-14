
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str

    model_config = {
        "from_attributes": True
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

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
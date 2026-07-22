
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

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
    user: UserResponse

class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    thread_id: str = Field(min_length=1, max_length=200)
    document_ids: Optional[list[str]] = None

    @field_validator("question")
    @classmethod
    def question_must_contain_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Question cannot be empty")
        return value.strip()


class ChatResponse(BaseModel):
    answer: str | None = None
    status: str
    interrupt: dict | None = None

class ApprovalRequest(BaseModel):
    thread_id: str
    approved: bool

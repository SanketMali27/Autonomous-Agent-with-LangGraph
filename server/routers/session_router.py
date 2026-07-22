from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from repositories.chat_repository import ChatRepository
from services.chat_service import ChatService

from app.schemas import (
    CreateSessionRequest,
    SessionResponse,
    ChatMessageResponse,
)

from auth.dependencies import get_current_user
from database.models import User

router = APIRouter(
    prefix="/sessions",
    tags=["Chat Sessions"],
)
print("Session router loaded")
#Create Session
@router.post("", response_model=SessionResponse)
def create_session(
    request: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = ChatService(ChatRepository(db))

    return service.create_session(
        user_id=current_user.user_id,
        title=request.title,
    )

#Get All Sessions
@router.get("", response_model=list[SessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = ChatService(ChatRepository(db))

    return service.get_user_sessions(
        current_user.user_id
    )

#Get Session Messages
@router.get(
    "/{session_id}",
    response_model=list[ChatMessageResponse],
)
def get_session_messages(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = ChatService(ChatRepository(db))

    return service.get_session_messages(
        session_id
    )


#Delete Session
@router.delete("/{session_id}")
def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = ChatService(ChatRepository(db))

    service.delete_session(session_id)

    return {
        "message": "Chat session deleted."
    }
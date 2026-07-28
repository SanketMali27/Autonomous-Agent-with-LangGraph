from uuid import UUID

from sqlalchemy.orm import Session

from database.chat_message import ChatMessage
from database.chat_session import ChatSession


class ChatRepository:

    def __init__(self, db: Session):
        self.db = db

    # -----------------------------
    # Chat Session
    # -----------------------------

    def create_session(
        self,
        user_id: UUID,
        title: str,
        session_id: UUID | None = None,
    ) -> ChatSession:

        session = ChatSession(
            user_id=user_id,
            title=title,
        )

        if session_id is not None:
            session.session_id = session_id

        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)

        return session
    
    def get_session(
        self,
        session_id: UUID,
        user_id: UUID
    ) -> ChatSession | None:

        return (
            self.db.query(ChatSession)
            .filter(ChatSession.session_id == session_id,
                    ChatSession.user_id == user_id,
               )
            .first()
        )

    def get_user_sessions(
        self,
        user_id: UUID,
    ) -> list[ChatSession]:

        return (
            self.db.query(ChatSession)
            .filter(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
            .all()
        )

    def update_session_timestamp(
        self,
        session: ChatSession,
    ) -> None:

        self.db.add(session)
        self.db.commit()

    def delete_session(
        self,
        session_id: UUID,
        user_id: UUID,
    ) -> None:

        session = (
            self.db.query(ChatSession)
            .filter(
                ChatSession.session_id == session_id,
                ChatSession.user_id == user_id,
            )
            .first()
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Session not found",
            )

        self.db.delete(session)
        self.db.commit()

    # -----------------------------
    # Chat Messages
    # -----------------------------

    def save_message(
        self,
        session_id: UUID,
        role: str,
        content: str,
    ) -> ChatMessage:

        message = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
        )

        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return message

    def get_session_messages(
      self,
      session_id: UUID,
      user_id: UUID,
):

      session = (
        self.db.query(ChatSession)
        .filter(
            ChatSession.session_id == session_id,
            ChatSession.user_id == user_id,
        )
        .first()
         )

      if session is None:
         raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

      return (
          self.db.query(ChatMessage)
            .filter(
            ChatMessage.session_id == session_id
           )
          .order_by(ChatMessage.created_at.asc())
          .all()
         )
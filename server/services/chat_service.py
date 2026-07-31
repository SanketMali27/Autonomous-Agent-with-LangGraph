from uuid import UUID
from services.chat_summary import generate_summary

from repositories.chat_repository import ChatRepository


class ChatService:

    def __init__(self, repository: ChatRepository):
        self.repository = repository

    def create_session(
        self,
        user_id: UUID,
        title: str,
        session_id: UUID | None = None,
    ):
        return self.repository.create_session(
            user_id=user_id,
            title=title,
            session_id=session_id,
        )
    def get_session(
        self,
        session_id: UUID,
        user_id: UUID,
    ):
        return self.repository.get_session(
            session_id=session_id,
            user_id=user_id,
        )
    
    def get_user_sessions(
        self,
        user_id: UUID,
    ):
        return self.repository.get_user_sessions(
            user_id=user_id,
        )

    def get_session_messages(
        self,
        session_id: UUID,
        user_id: UUID,
    ):
        return self.repository.get_session_messages(
            session_id=session_id,
            user_id=user_id,
        )

    def save_message(
        self,
        session_id: UUID,
        role: str,
        user_id:UUID,
        content: str,
    ):
        session = self.repository.get_session( session_id=session_id,
                    user_id=user_id,)

        if session is None:
            raise ValueError("Chat session not found.")

        message = self.repository.save_message(
            session_id=session_id,
            role=role,
            content=content,
        )

        self.repository.update_session_timestamp(session)

        return message

    def delete_session(
        self,
        session_id: UUID,
        user_id:UUID,
    ):
        session = self.repository.get_session(session_id=session_id,
                                              user_id=user_id)

        if session is None:
            raise ValueError("Chat session not found.")

        self.repository.delete_session( session_id=session_id,
        user_id=user_id,)

    def update_session_title(
    self,
    session_id: UUID,
    user_id: UUID,
    title: str,
    ):
        session = self.repository.get_session(
            session_id=session_id,
            user_id=user_id,
        )

        if session is None:
            raise ValueError("Chat session not found.")

        return self.repository.update_session_title(
            session,
            title,
        )    

    def get_summary(
    self,
    session_id: UUID,
    user_id: UUID,
):
        return self.repository.get_summary(
            session_id,
            user_id,
        )


    def update_summary(
        self,
        session_id: UUID,
        user_id: UUID,
        summary: str,
    ):
        return self.repository.update_summary(
            session_id,
            user_id,
            summary,
        )


    def get_recent_messages(
        self,
        session_id: UUID,
        user_id: UUID,
        limit: int = 6,
    ):
        return self.repository.get_recent_messages(
            session_id,
            user_id,
            limit,
        )



    def refresh_summary(
        self,
        session_id,
        user_id,
    ):
        summary = self.get_summary(
            session_id,
            user_id,
        )

        messages = self.get_recent_messages(
            session_id,
            user_id,
            limit=20,
        )

        new_summary = generate_summary(
            summary,
            messages,
        )

        self.update_summary(
            session_id,
            user_id,
            new_summary,
        )

    def maybe_refresh_summary(
        self,
        session_id: UUID,
        user_id: UUID,
    ):
        count = self.repository.get_message_count(
            session_id
        )

        if count % 10 != 0:
            return

        self.refresh_summary(
            session_id,
            user_id,
        )
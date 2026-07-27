from uuid import UUID

from repositories.chat_repository import ChatRepository


class ChatService:

    def __init__(self, repository: ChatRepository):
        self.repository = repository

    def create_session(
        self,
        user_id: UUID,
        title: str,
    ):
        return self.repository.create_session(
            user_id=user_id,
            title=title,
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
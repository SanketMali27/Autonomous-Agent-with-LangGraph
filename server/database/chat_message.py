from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.db import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    __table_args__ = (
        CheckConstraint(
            "role IN ('user','assistant','system')",
            name="check_message_role",
        ),
    )

    message_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "chat_sessions.session_id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    role = Column(
        Text,
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    session = relationship(
        "ChatSession",
        back_populates="messages",
    )
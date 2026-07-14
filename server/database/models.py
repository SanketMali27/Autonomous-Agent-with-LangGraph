from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Column
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from uuid import uuid4

from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    username = Column(
        String,
        nullable=False,
    )

    hashed_password = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

class Document(Base):

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    user_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        index=True,
    )

    document_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
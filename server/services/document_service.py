
from sqlalchemy.orm import Session
from database.models import Document


def get_user_documents(db: Session, user_id: str):
    return (
        
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
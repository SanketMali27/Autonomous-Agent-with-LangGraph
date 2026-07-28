from uuid import UUID, uuid4

from app.schemas import ChatRequest


def test_chat_request_accepts_thread_id_as_session_id():
    session_id = str(uuid4())

    request = ChatRequest(question="Hello there", thread_id=session_id)

    assert request.session_id == UUID(session_id)

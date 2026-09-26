from contextlib import contextmanager
from langgraph.checkpoint.postgres import PostgresSaver
from app.config import DATABASE_URL


@contextmanager
def create_memory():
    with PostgresSaver.from_conn_string(DATABASE_URL) as memory:
        print("CHECKPOINTER CREATED")
        print("Connection closed:", memory.conn.closed)

        memory.setup()
        yield memory

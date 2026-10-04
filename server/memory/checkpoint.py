from contextlib import asynccontextmanager

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.config import DATABASE_URL


@asynccontextmanager
async def create_memory():
    async with AsyncPostgresSaver.from_conn_string(DATABASE_URL) as memory:
        await memory.setup()
        print("CHECKPOINTER CREATED")
        print("Connection closed:", memory.conn.closed)
        yield memory

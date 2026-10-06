from contextlib import asynccontextmanager

from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.config import DATABASE_URL


@asynccontextmanager
async def create_memory():
    async with AsyncConnectionPool(
        conninfo=DATABASE_URL,
        min_size=1,
        max_size=10,
        kwargs={
            "autocommit": True,
            "prepare_threshold": 0,
            "row_factory": dict_row,
        },
    ) as pool:

        memory = AsyncPostgresSaver(pool)

        await memory.setup()

        print("CHECKPOINTER CREATED")
        print("PostgreSQL connection pool created")

        yield memory
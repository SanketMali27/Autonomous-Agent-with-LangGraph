from langgraph.checkpoint.sqlite import SqliteSaver


def create_memory(db_path: str = "checkpoints.db"):
    return SqliteSaver.from_conn_string(db_path)

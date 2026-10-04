import logfire


def configure_observability():
    logfire.configure()

    logfire.instrument_pydantic()
    logfire.instrument_httpx()
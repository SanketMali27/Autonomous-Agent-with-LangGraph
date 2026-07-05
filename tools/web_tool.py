from tavily import TavilyClient

from app.config import TAVILY_API_KEY

client = TavilyClient(api_key=TAVILY_API_KEY)


def web_search(query: str):

    result = client.search(
        query=query,
        max_results=5,
    )

    return result["results"]
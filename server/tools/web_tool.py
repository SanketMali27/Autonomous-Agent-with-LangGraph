from tavily import TavilyClient

from app.config import TAVILY_API_KEY
from langsmith import traceable,get_current_run_tree
client = TavilyClient(api_key=TAVILY_API_KEY)

@traceable(name="web_search", 
           run_type="tool",
           tags=["web"],
           description="Search the web using Tavily API")
def web_search(query: str):

    result = client.search(
        query=query,
        max_results=5,
    )
    run = get_current_run_tree()

    run.metadata["max_results"] = 5
    run.metadata["results_found"] = len(result)

    return result["results"]
def rule_based_router(question: str):

    q = question.lower()

    web_keywords = [
        "latest",
        "today",
        "current",
        "news",
        "recent",
        "live",
    ]

    python_keywords = [
        "calculate",
        "sum",
        "average",
        "csv",
        "excel",
        "plot",
        "graph",
        "pandas",
        "dataframe",
        "analysis",
    ]

    if any(word in q for word in web_keywords):
        return "web"

    if any(word in q for word in python_keywords):
        return "python"

    return None
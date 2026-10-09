"""
Rule-based query router.

Instead of "first keyword wins", every route collects weighted evidence from
regex patterns. The route with the strongest evidence wins, and a confidence
score tells you when the rules are unsure so you can fall back to an LLM.

Routes
------
rag      -> answer from the user's uploaded docs / knowledge base
web      -> needs fresh or real-time information from the internet
python   -> needs computation, data analysis, plotting, or code execution
natural  -> general chat / explanation / writing (plain LLM answer)
meta     -> questions about the assistant itself or the chat session
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple

VALID_ROUTES = {"rag", "web", "python", "natural", "meta"}

DEFAULT_ROUTE = "natural"   # used when nothing matches and no LLM fallback exists
MIN_SCORE = 2.0             # below this, the rules are considered "unsure"
MIN_MARGIN = 0.75           # winner must beat runner-up by this much, else "unsure"

# Tie-break order when two routes have equal scores (earlier = higher priority).
PRIORITY = ["meta", "rag", "python", "web", "natural"]


# --------------------------------------------------------------------------- #
# Rules: (regex, weight, label)
# --------------------------------------------------------------------------- #
def _r(pattern: str, weight: float, label: str) -> Tuple[re.Pattern, float, str]:
    return re.compile(pattern, re.IGNORECASE), weight, label


RULES: Dict[str, List[Tuple[re.Pattern, float, str]]] = {
    "meta": [
        _r(r"\bwho are you\b|\bwhat are you\b|\byour name\b", 5, "identity question"),
        _r(r"\bwhat can you (do|help)\b|\bhow (do|does) (you|this) work\b", 5, "capabilities"),
        _r(r"\b(your|the assistant'?s?) (capabilities|limitations|features|tools|model)\b", 4, "about assistant"),
        _r(r"\bwhich (model|llm|ai) (are|do) you\b|\bare you (an? )?(ai|bot|llm|human)\b", 5, "model question"),
        _r(r"\b(clear|reset|delete|forget)\b.{0,15}\b(chat|history|memory|conversation)\b", 4, "session command"),
        _r(r"^\s*(help|/help|menu|commands?)\s*[?!.]*\s*$", 5, "help command"),
        _r(r"\bwhat (routes|modes|agents|tools) (do you|are)\b", 4, "routing question"),
    ],
    "rag": [
        _r(
            r"\b(in|from|per|according to|based on|using)\s+(the|my|this|our|that|these|those|uploaded|attached)?\s*"
            r"(document|doc|docs|pdf|file|files|report|notes|resume|cv|paper|article|contract|"
            r"knowledge ?base|kb|handbook|wiki|policy|slides?|deck|transcript|manual)\b",
            4.5, "refers to a document",
        ),
        _r(r"\b(uploaded|attached|ingested|indexed)\b", 3, "uploaded content"),
        _r(r"\bsummari[sz]e\b.{0,25}\b(document|pdf|file|paper|report|notes|chapter|article)\b", 3.5, "summarize doc"),
        _r(r"\b(my|our)\s+(resume|cv|notes|docs|documents|project|codebase|policy|handbook|wiki)\b", 2.5, "personal corpus"),
        _r(r"\b(chapter|section|page|slide|paragraph)\s*\d+\b", 2, "locator in a doc"),
        _r(r"\bwhat does (the|this) (document|pdf|file|paper|report|author|contract) (say|mention|state)\b", 4, "doc question"),
        _r(r"\b(find|search|look)\b.{0,20}\b(in|within|inside)\b.{0,15}\b(documents?|files?|notes|knowledge ?base)\b", 3.5, "search corpus"),
        _r(r"\bcontext (above|provided|given)\b", 2.5, "given context"),
    ],
    "web": [
        _r(r"\b(latest|newest|breaking|trending|upcoming)\b", 3, "recency word"),
        _r(r"\bnews\b|\bheadlines?\b", 3.5, "news"),
        _r(r"\b(today|tonight|tomorrow|yesterday|right now|as of now|this (week|month|year|weekend))\b", 2.5, "time anchor"),
        _r(r"\bcurrent(ly)?\b", 2, "current"),
        _r(r"\brecent(ly)?\b", 2, "recent"),
        _r(r"\blive\b(?!\s*(?:code|coding|demo))", 1.5, "live"),
        _r(r"\b(weather|forecast|temperature in)\b", 4, "weather"),
        _r(r"\b(stock|share|crypto|bitcoin|btc|eth|gold|petrol|diesel)\s*(price|rate|value)?\b.{0,20}\b(now|today|current|price)\b", 3.5, "market data"),
        _r(r"\b(price|rate|cost) of\b|\bexchange rate\b|\busd (to|in) (inr|eur|gbp)\b", 3, "price lookup"),
        _r(r"\b(score|result|standings|fixture|schedule)s?\b.{0,20}\b(match|game|ipl|cricket|football|nba|league)\b", 3.5, "sports"),
        _r(r"\bwho (is|are) the (current |new |present )?(ceo|cto|president|prime minister|pm|chairman|founder|head)\b", 4, "current office-holder"),
        _r(r"\b(202[5-9]|203\d)\b", 2, "recent year"),
        _r(r"\b(release date|launch date|released|launched|announced)\b", 2, "release info"),
        _r(r"\b(search|google|browse|look up|lookup)\b.{0,15}\b(web|internet|online|google)\b|\bsearch (for|online)\b", 4.5, "explicit web search"),
        _r(r"\b(hiring|openings?|vacanc(y|ies)|job postings?)\b.{0,25}\b(now|currently|at|in)\b", 2.5, "live listings"),
        _r(r"https?://\S+", 2.5, "contains URL"),
    ],
    "python": [
        _r(r"\b(calculate|compute|evaluate|solve|simplify)\b", 3, "calculation verb"),
        _r(r"\b\d+(?:\.\d+)?\s*(?:[+*/^×÷]|\s-\s|\bx\b)\s*\d+", 3.5, "arithmetic expression"),
        _r(r"\b\d+(?:\.\d+)?\s*%\s*of\s*\d+", 3.5, "percentage calc"),
        _r(r"\b(sum|total|average|mean|median|mode|variance|std|standard deviation|min|max|count)\b\s*(of|for)?\b", 2, "aggregate"),
        _r(r"\.(csv|xlsx?|tsv|parquet|json)\b|\b(csv|excel|spreadsheet|dataset|dataframe)\b", 3.5, "tabular data"),
        _r(r"\b(pandas|numpy|matplotlib|seaborn|scipy|sklearn|scikit-learn|plotly)\b", 3.5, "data library"),
        _r(r"\b(plot|graph|chart|histogram|scatter|heatmap|visuali[sz]e)\b", 2.5, "plotting"),
        _r(r"\b(correlation|regression|forecast model|clustering|outliers?|distribution|group ?by|pivot)\b", 2.5, "stats op"),
        _r(r"\b(run|execute)\b.{0,15}\b(code|script|snippet|python|program)\b", 4, "execute code"),
        _r(r"\banaly[sz](e|is|ing)\b", 1.5, "analysis"),
        _r(r"\b(convert|how many)\b.{0,30}\b(km|miles?|kg|lbs?|celsius|fahrenheit|hours?|days?|minutes?|seconds?)\b", 2, "unit conversion"),
        _r(r"\b(factorial|prime|fibonacci|gcd|lcm|sqrt|square root|logarithm|derivative|integral|matrix)\b", 3, "math term"),
        _r(r"\b(emi|compound interest|simple interest|cagr|roi)\b", 3, "finance formula"),
    ],
    "natural": [
        _r(r"^\s*(hi|hello|hey|hii+|yo|thanks?|thank you|thx|ok(ay)?|cool|nice|bye|good (morning|afternoon|evening|night))\b", 5, "greeting / chit-chat"),
        _r(r"\b(explain|define|describe|what is|what are|what's|why|how does|how do|difference between|compare)\b", 1.5, "explanatory"),
        _r(r"\b(write|draft|rewrite|rephrase|proofread|translate|brainstorm|suggest|recommend|improve)\b", 2, "writing task"),
        _r(r"\b(joke|poem|story|email|cover letter|linkedin|caption|essay)\b", 2.5, "creative / writing"),
        _r(r"\bwrite (me )?(a |an |the )?(python |js |java |c\+\+ |sql )?(code|function|program|script|query)\b", 3, "code generation (not execution)"),
        _r(r"\b(advice|tips?|should i|ideas?|pros and cons|roadmap|interview)\b", 1.5, "advice"),
    ],
}


# --------------------------------------------------------------------------- #
# Result type
# --------------------------------------------------------------------------- #
@dataclass
class RouteDecision:
    route: str
    confidence: float                      # 0.0 - 1.0
    scores: Dict[str, float]               # raw evidence per route
    reasons: List[str] = field(default_factory=list)   # matched rule labels for the winner
    used_fallback: bool = False            # True if llm_fallback / default decided it

    @property
    def is_confident(self) -> bool:
        return self.confidence >= 0.55 and not self.used_fallback


# --------------------------------------------------------------------------- #
# Core scoring
# --------------------------------------------------------------------------- #
def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def _score(question: str, has_documents: bool) -> Tuple[Dict[str, float], Dict[str, List[str]]]:
    q = _normalize(question)
    scores = {route: 0.0 for route in VALID_ROUTES}
    reasons: Dict[str, List[str]] = {route: [] for route in VALID_ROUTES}

    for route, rules in RULES.items():
        for pattern, weight, label in rules:
            if pattern.search(q):
                scores[route] += weight
                reasons[route].append(label)

    # ---- Cross-route adjustments (the "advanced" part) ------------------- #
    # 1. A data file + a computation verb is Python, even if "latest"/"current" appears.
    if "tabular data" in reasons["python"] and scores["web"] > 0:
        scores["web"] *= 0.5

    # 2. Mentioning a document/file strongly implies RAG over web or natural.
    if reasons["rag"]:
        scores["natural"] *= 0.6
        if "tabular data" in reasons["python"]:
            # "analyze sales.csv" -> python, not rag
            scores["rag"] *= 0.5

    # 3. If documents are loaded in the session, give RAG a small prior for
    #    questions that reference "the/this/these" without a web/time signal.
    if has_documents and not reasons["web"] and not reasons["meta"]:
        if re.search(r"\b(the|this|these|that|those|it)\b", q.lower()):
            scores["rag"] += 1.0

    # 4. Explicit "search the web" always beats the weak signals.
    if "explicit web search" in reasons["web"]:
        scores["web"] += 2

    # 5. Pure-greeting short messages should stay natural.
    if "greeting / chit-chat" in reasons["natural"] and len(q.split()) <= 4:
        for route in ("web", "python", "rag"):
            scores[route] *= 0.3

    # 6. "Explain/what is" about a computation topic is a concept question, not execution.
    if re.match(r"^\s*(explain|what is|what are|define|why)\b", q.lower()):
        if not re.search(r"\d", q) and "execute code" not in reasons["python"]:
            scores["python"] *= 0.6

    # 7. Very long queries dilute keywords; slightly favor natural reasoning.
    if len(q.split()) > 60:
        scores["natural"] += 1.0

    return scores, reasons


def _confidence(scores: Dict[str, float], top_route: str) -> float:
    top = scores[top_route]
    others = [s for r, s in scores.items() if r != top_route]
    second = max(others) if others else 0.0
    total = sum(scores.values()) or 1.0
    share = top / total                  # how dominant the winner is
    strength = min(1.0, top / 5.0)       # how much evidence it has in absolute terms
    margin = min(1.0, (top - second) / 3.0)
    return round(0.4 * share + 0.35 * strength + 0.25 * margin, 3)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def route_query(
    question: str,
    has_documents: bool = False,
    llm_fallback: Optional[Callable[[str], str]] = None,
    default: str = DEFAULT_ROUTE,
) -> RouteDecision:
    """
    Decide which route should handle `question`.

    has_documents : True if the user has uploaded / indexed documents this session.
    llm_fallback  : optional callable(question) -> route string. Only called when
                    the rules are unsure (low score or tiny margin).
    default       : route used when unsure and no (valid) LLM answer is available.
    """
    if default not in VALID_ROUTES:
        raise ValueError(f"default must be one of {sorted(VALID_ROUTES)}")

    if not question or not question.strip():
        return RouteDecision(default, 0.0, {r: 0.0 for r in VALID_ROUTES}, ["empty query"], True)

    scores, reasons = _score(question, has_documents)

    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], PRIORITY.index(kv[0])))
    (top_route, top_score), (_, second_score) = ranked[0], ranked[1]
    confidence = _confidence(scores, top_route)

    unsure = top_score < MIN_SCORE or (top_score - second_score) < MIN_MARGIN

    if not unsure:
        return RouteDecision(top_route, confidence, scores, reasons[top_route])

    # Rules are unsure -> ask the LLM (if provided), validating its answer.
    if llm_fallback is not None:
        try:
            guess = (llm_fallback(question) or "").strip().lower()
        except Exception:
            guess = ""
        if guess in VALID_ROUTES:
            return RouteDecision(guess, confidence, scores, ["llm fallback"], True)

    # No LLM: keep the rules' best guess if it has *some* evidence, else default.
    if top_score >= 1.0 and (top_score - second_score) >= 0:
        return RouteDecision(top_route, confidence, scores, reasons[top_route] + ["weak evidence"], True)
    return RouteDecision(default, confidence, scores, ["no signal, default route"], True)


def rule_based_router(question: str, has_documents: bool = False) -> Optional[str]:
    """
    Backward-compatible wrapper for your old function.
    Returns a route string when the rules are confident, otherwise None
    (so your existing "if None -> ask the LLM" logic keeps working).
    """
    decision = route_query(question, has_documents=has_documents)
    if decision.is_confident:
        return decision.route
    return None


# --------------------------------------------------------------------------- #
# Quick self-test:  python router.py
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    tests = [
        ("hi there", "natural"),
        ("who are you?", "meta"),
        ("what can you do", "meta"),
        ("clear my chat history", "meta"),
        ("latest news on OpenAI", "web"),
        ("what's the weather in Pune today", "web"),
        ("current bitcoin price", "web"),
        ("who is the current CEO of Razorpay", "web"),
        ("calculate 15% of 2400", "python"),
        ("average of the salary column in sales.csv", "python"),
        ("plot a histogram using pandas", "python"),
        ("latest trends in sales.csv", "python"),
        ("summarize the uploaded pdf", "rag"),
        ("according to my resume, what are my skills?", "rag"),
        ("what does the document say about refund policy", "rag"),
        ("explain how JWT authentication works", "natural"),
        ("write a python function to reverse a linked list", "natural"),
        ("draft a cold email to a recruiter", "natural"),
        ("search the web for MERN stack internships", "web"),
        ("12 * 45 + 7", "python"),
    ]
    passed = 0
    for q, expected in tests:
        d = route_query(q, has_documents=("pdf" in q or "resume" in q))
        ok = d.route == expected
        passed += ok
        print(f"{'OK ' if ok else 'BAD'} {d.route:<8} conf={d.confidence:<5} {q!r}  -> {d.reasons}")
    print(f"\n{passed}/{len(tests)} passed")
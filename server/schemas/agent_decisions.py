from typing import Literal

from pydantic import BaseModel, Field


class RouteDecision(BaseModel):
    route: Literal[
        "rag",
        "web",
        "python",
        "natural",
        "meta",
    ] = Field(
        description="The route that should handle the user's request."
    )


class GradeDecision(BaseModel):
    score: Literal[
        "relevant",
        "irrelevant",
    ] = Field(
        description="Whether the retrieved documents are sufficient and relevant."
    )


class CriticDecision(BaseModel):
    score: Literal[
        "supported",
        "unsupported",
    ] = Field(
        description="Whether the generated answer is fully supported by the retrieved context."
    )
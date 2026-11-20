from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from intel_service import IntelUnavailable, search_intel

router = APIRouter(prefix="/intel", tags=["spectre-intel"])

SILENT_SPIRITS = "The spirits are silent. Try again shortly."


class IntelQuery(BaseModel):
    query: str = Field(..., min_length=2, max_length=120)

    @field_validator("query")
    @classmethod
    def strip_query(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Query must be at least 2 characters")
        return v


class IntelResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str


class IntelResponse(BaseModel):
    query: str
    results: List[IntelResult]
    recommended: List[str]
    cached: bool


@router.post(
    "/search",
    response_model=IntelResponse,
    responses={502: {"description": "You.com unavailable (missing key, upstream error or timeout)"}},
)
async def intel_search(payload: IntelQuery) -> IntelResponse:
    try:
        return IntelResponse(**await search_intel(payload.query))
    except IntelUnavailable:
        raise HTTPException(status_code=502, detail=SILENT_SPIRITS)

"""You.com Search client with a 10-minute in-memory TTL cache. The API key never leaves this module."""

import logging
import os
import time
from typing import Any, Dict, List, Tuple
from urllib.parse import urlparse

import httpx

from intel_rules import recommend_gear

logger = logging.getLogger("llanfair_spectre_forge.intel")

YOU_SEARCH_URL = "https://ydc-index.io/v1/search"
TIMEOUT_SECONDS = 12.0
CACHE_TTL_SECONDS = 600
MAX_RESULTS = 6
MAX_CACHE_ENTRIES = 200
SEARCH_CONTEXT = "haunted ghost paranormal"

_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}


class IntelUnavailable(Exception):
    """Raised when You.com cannot answer (missing key, upstream error, timeout)."""


def _source(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def _snippet(item: Dict[str, Any]) -> str:
    snippets = item.get("snippets")
    if isinstance(snippets, list) and snippets:
        text = " ".join(str(s) for s in snippets[:2])
    else:
        text = str(snippets or item.get("description") or "")
    text = " ".join(text.split())
    return text[:320] + ("…" if len(text) > 320 else "")


def _normalize(raw: Dict[str, Any]) -> List[Dict[str, str]]:
    results = raw.get("results") if isinstance(raw, dict) else None
    if not isinstance(results, dict):
        return []
    items = [*(results.get("web") or []), *(results.get("news") or [])]
    seen, normalized = set(), []
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if not url.startswith("http") or url in seen:
            continue
        seen.add(url)
        normalized.append(
            {
                "title": str(item.get("title") or _source(url)),
                "url": url,
                "snippet": _snippet(item),
                "source": _source(url),
            }
        )
    return normalized


async def _fetch(query: str) -> Dict[str, Any]:
    api_key = os.environ.get("YDC_API_KEY", "").strip()
    if not api_key:
        raise IntelUnavailable("missing key")
    body = {"query": f"{query} {SEARCH_CONTEXT}", "count": 8, "safesearch": "moderate"}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            res = await client.post(YOU_SEARCH_URL, headers={"X-API-Key": api_key}, json=body)
    except httpx.TimeoutException as exc:
        raise IntelUnavailable("timeout") from exc
    except httpx.HTTPError as exc:
        raise IntelUnavailable(type(exc).__name__) from exc
    if res.status_code != 200:
        raise IntelUnavailable(f"upstream status {res.status_code}")
    try:
        return res.json()
    except ValueError as exc:
        raise IntelUnavailable("invalid json") from exc


GENERIC_TOKENS = {
    "the", "and", "church", "island", "woods", "wood", "bridge", "arches", "house", "hall", "castle",
    "saint", "st", "letter", "platform", "station", "tomb", "passage", "foreshore", "column", "haunted",
    "ghost", "ghosts", "most", "old", "ruins", "abbey", "manor", "marquess",
}


def _relevant(results: List[Dict[str, str]], query: str) -> List[Dict[str, str]]:
    tokens = [t for t in "".join(c if c.isalnum() else " " for c in query.lower()).split() if len(t) >= 3]
    distinctive = [t for t in tokens if t not in GENERIC_TOKENS] or tokens
    if not distinctive:
        return results
    return [r for r in results if any(t in f"{r['title']} {r['snippet']} {r['url']}".lower() for t in distinctive)]


def _prune_cache(now: float) -> None:
    for k in [k for k, (expires, _) in _cache.items() if expires <= now]:
        del _cache[k]
    while len(_cache) >= MAX_CACHE_ENTRIES:
        del _cache[min(_cache, key=lambda k: _cache[k][0])]


async def search_intel(query: str) -> Dict[str, Any]:
    key = " ".join(query.lower().split())
    hit = _cache.get(key)
    if hit and hit[0] > time.monotonic():
        return {**hit[1], "cached": True}

    try:
        results = _relevant(_normalize(await _fetch(query)), query)[:MAX_RESULTS]
        corpus = " ".join(f"{r['title']} {r['snippet']}" for r in results)
        recommended = recommend_gear(corpus) if results else []
    except IntelUnavailable as exc:
        logger.warning("You.com intel unavailable: %s", exc)
        raise
    except Exception as exc:  # unexpected upstream shape must never surface as a 500
        logger.exception("Unexpected intel parsing failure")
        raise IntelUnavailable("parse error") from exc

    payload = {"query": query, "results": results, "recommended": recommended, "cached": False}
    now = time.monotonic()
    _prune_cache(now)
    _cache[key] = (now + CACHE_TTL_SECONDS, payload)
    return payload

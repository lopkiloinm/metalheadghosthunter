"""CARTO dark basemap tile proxy. CARTO_API_KEY stays server-side; falls back to keyless Esri dark tiles."""

import asyncio
import hashlib
import logging
import os
import time
from collections import OrderedDict
from typing import Dict, Optional, Tuple

import httpx
from fastapi import APIRouter, HTTPException, Response

logger = logging.getLogger("llanfair_spectre_forge.tiles")
router = APIRouter(prefix="/map", tags=["map"])

CARTO_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
ESRI_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
PROBE = (14, 8003, 5320)  # a Llanfairpwll tile
CACHE_MAX = 600
STATUS_TTL = 600
TILE_HEADERS = {"Cache-Control": "public, max-age=86400, immutable"}
FALLBACK_HEADERS = {"Cache-Control": "public, max-age=300"}

_tiles: "OrderedDict[Tuple[int, int, int], Tuple[bytes, str, str]]" = OrderedDict()
_status: Dict[str, object] = {"checkedAt": 0.0}
_client: Optional[httpx.AsyncClient] = None
_probe_lock = asyncio.Lock()


def _http() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=8.0, headers={"User-Agent": "LlanfairSpectreForge/1.0"})
    return _client


async def _get(url: str, params: Optional[Dict[str, str]] = None) -> Optional[bytes]:
    try:
        res = await _http().get(url, params=params)
    except httpx.HTTPError as exc:
        logger.warning("Tile upstream error: %s", type(exc).__name__)
        return None
    if res.status_code != 200 or not res.headers.get("content-type", "").startswith("image/"):
        return None
    return res.content


async def _carto(z: int, x: int, y: int, key: str) -> Optional[bytes]:
    url = CARTO_URL.format(s="abcd"[(x + y) % 4], z=z, x=x, y=y)
    return await _get(url, {"key": key})


async def tile_status() -> Dict[str, object]:
    """Probe once per TTL: keyed CARTO tile must differ from the keyless 'API KEY REQUIRED' watermark."""
    if time.monotonic() - float(_status["checkedAt"]) < STATUS_TTL:
        return _status
    async with _probe_lock:
        if time.monotonic() - float(_status["checkedAt"]) < STATUS_TTL:
            return _status
        return await _probe()


async def _probe() -> Dict[str, object]:
    key = os.environ.get("CARTO_API_KEY", "").strip()
    valid = False
    if key:
        keyed = await _carto(*PROBE, key)
        watermark = await _get(CARTO_URL.format(s="a", z=PROBE[0], x=PROBE[1], y=PROBE[2]))
        valid = bool(keyed) and (watermark is None or hashlib.sha1(keyed).digest() != hashlib.sha1(watermark).digest())
    _status.update(
        checkedAt=time.monotonic(),
        keyConfigured=bool(key),
        keyValid=valid,
        source="carto" if valid else "esri-fallback",
    )
    logger.info("Basemap source: %s (key configured: %s)", _status["source"], bool(key))
    return _status


def _remember(coord: Tuple[int, int, int], value: Tuple[bytes, str, str]) -> None:
    _tiles[coord] = value
    _tiles.move_to_end(coord)
    while len(_tiles) > CACHE_MAX:
        _tiles.popitem(last=False)


@router.get("/status")
async def map_status() -> Dict[str, object]:
    status = await tile_status()
    return {k: status[k] for k in ("source", "keyConfigured", "keyValid")}


@router.get(
    "/tiles/{z}/{x}/{y}.png",
    responses={200: {"content": {"image/png": {}}}, 502: {"description": "No tile source reachable"}},
    response_class=Response,
)
async def map_tile(z: int, x: int, y: int) -> Response:
    if not (0 <= z <= 20 and 0 <= x < 2**z and 0 <= y < 2**z):
        raise HTTPException(status_code=404, detail="Tile out of range")
    coord = (z, x, y)
    if coord in _tiles:
        _tiles.move_to_end(coord)
        body, media, source = _tiles[coord]
        return Response(body, media_type=media, headers={**TILE_HEADERS, "X-Tile-Source": source, "X-Tile-Cache": "HIT"})

    status = await tile_status()
    body, media, source = None, "image/png", "carto"
    if status["source"] == "carto":
        body = await _carto(z, x, y, os.environ.get("CARTO_API_KEY", "").strip())
    if body is None:
        body, media, source = await _get(ESRI_URL.format(z=z, x=x, y=y)), "image/jpeg", "esri-fallback"
    if body is None:
        raise HTTPException(status_code=502, detail="The cartographers are lost in the fog.")
    # Only cache tiles from the active source, so a one-off CARTO hiccup doesn't pin an Esri tile.
    stable = source == "carto" or status["source"] == "esri-fallback"
    if stable:
        _remember(coord, (body, media, source))
    headers = TILE_HEADERS if source == "carto" else FALLBACK_HEADERS
    return Response(body, media_type=media, headers={**headers, "X-Tile-Source": source, "X-Tile-Cache": "MISS"})

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query

from seed import EQUIPMENT_BY_SLUG, EQUIPMENT_CATALOG, HAUNTED_HOTSPOTS, LOADOUT_BUNDLES, RITUAL_ADDONS
from models import RoutesResponse
from routes_seed import FORGE_LOCATION, WALKING_ROUTES
from storage import store

router = APIRouter(tags=["catalog"])


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "forged",
        "service": "Llanfair Spectre Forge",
        "village": "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch",
        "storage": store.mode,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/equipment")
async def list_equipment(category: Optional[str] = Query(default=None)) -> Dict[str, Any]:
    items = EQUIPMENT_CATALOG
    if category and category.lower() != "all":
        items = [e for e in items if e["category"].lower() == category.lower()]
    return {"items": items, "count": len(items), "addons": RITUAL_ADDONS}


@router.get("/equipment/{slug}")
async def get_equipment(slug: str) -> Dict[str, Any]:
    item = EQUIPMENT_BY_SLUG.get(slug)
    if not item:
        raise HTTPException(status_code=404, detail=f"Equipment '{slug}' not found in the Forge.")
    return item


@router.get("/bundles")
async def list_bundles() -> Dict[str, Any]:
    return {"bundles": LOADOUT_BUNDLES}


@router.get("/hotspots")
async def list_hotspots() -> Dict[str, Any]:
    return {"hotspots": HAUNTED_HOTSPOTS}


@router.get("/routes", response_model=RoutesResponse)
async def list_routes() -> Dict[str, Any]:
    """Precomputed walking routes (OSRM foot profile) from the Forge to each haunt."""
    return {"forge": FORGE_LOCATION, "routes": WALKING_ROUTES}

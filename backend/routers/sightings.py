import random
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter

from models import Sighting, SightingCreate
from seed import HAUNTED_HOTSPOTS
from storage import store

router = APIRouter(prefix="/sightings", tags=["field-logs"])


@router.get("")
async def list_sightings() -> Dict[str, Any]:
    if store.online:
        docs = await store.db.sightings.find().sort("createdAt", -1).limit(40).to_list(length=40)
    else:
        docs = sorted(store.sightings_mem, key=lambda x: x["createdAt"], reverse=True)
    sightings = [Sighting.from_mongo(d).model_dump() for d in docs]
    return {"sightings": sightings, "count": len(sightings)}


HOTSPOTS_BY_ID = {h["id"]: h for h in HAUNTED_HOTSPOTS}


def _resolve_pin(payload: SightingCreate):
    if payload.lat is not None:
        return round(payload.lat, 5), round(payload.lng, 5)
    spot = HOTSPOTS_BY_ID.get(payload.hotspotId or "")
    if not spot:
        return None, None
    # Scatter pins ~40m around the haunt so several logs don't stack exactly.
    return round(spot["lat"] + random.uniform(-0.0004, 0.0004), 5), round(spot["lng"] + random.uniform(-0.0006, 0.0006), 5)


@router.post("", status_code=201)
async def create_sighting(payload: SightingCreate) -> Dict[str, Any]:
    lat, lng = _resolve_pin(payload)
    sighting = Sighting(
        id=f"log-{uuid.uuid4().hex[:8]}",
        hunterName=payload.hunterName.strip(),
        bandOrCoven=(payload.bandOrCoven or "").strip() or "Lone Wolf",
        location=payload.location.strip(),
        gearUsed=payload.gearUsed.strip(),
        peakEmf=round(payload.peakEmf, 1),
        soundtrack=(payload.soundtrack or "").strip(),
        report=payload.report.strip(),
        hotspotId=payload.hotspotId if payload.hotspotId in HOTSPOTS_BY_ID else None,
        lat=lat,
        lng=lng,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )
    if store.online:
        await store.db.sightings.insert_one(sighting.to_mongo())
    else:
        store.sightings_mem.insert(0, sighting.to_mongo())
    return {"sighting": sighting.model_dump()}

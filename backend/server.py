"""
Llanfair Spectre Forge — FastAPI Backend
Emergent.sh-compatible full-stack backend (prefix: /api, port: 8001, MongoDB via MONGO_URL).
Includes automatic in-memory fallback when running locally without a MongoDB daemon.
"""

from __future__ import annotations

import logging
import os
import random
import string
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("llanfair_spectre_forge")

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except ImportError:
    AsyncIOMotorClient = None  # type: ignore


# ---------------------------------------------------------------------------
# Seed Data — Llanfairpwllgwyngyll Metalhead Ghost Hunting Armoury
# ---------------------------------------------------------------------------

EQUIPMENT_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "eq-emf-666",
        "slug": "doomspike-emf",
        "modelKey": "emf",
        "name": 'K-II "DOOMSPIKE" EMF METER',
        "subtitle": "Model 666-MKIV Electromagnetic Field Detector",
        "category": "EMF & Fields",
        "dailyRate": 18,
        "deposit": 40,
        "stock": 7,
        "threatRating": 4,
        "accentColor": "#ff2a4b",
        "metalTagline": "Calibrated from 0.1 mG whisper to 66.6 mG Poltergeist Breakdown.",
        "description": (
            "Forged in a cast-aluminium chassis with knurled steel side bumpers and 5 hyper-bright "
            "stage-grade LED pips. Built to survive wet Anglesey slate, subterranean crypts, and "
            "sudden Class-IV demonic voltage surges."
        ),
        "specs": {
            "Range": "0.1 – 66.6 mG (50Hz–20kHz)",
            "Response": "Instantaneous (< 5ms LED spike)",
            "Battery": "9V Black-Cell (48 hrs continuous)",
            "Weatherproof": "IP65 Welsh Gale Resistant",
        },
        "soundtrackPairing": "Black Sabbath — Black Sabbath (1970)",
        "overdriveLabel": "66.6 mG SURGE TEST",
    },
    {
        "id": "eq-spiritbox-7",
        "slug": "necro-sweep-spiritbox",
        "modelKey": "spiritbox",
        "name": 'SBM-7 "NECRO-SWEEP" SPIRIT BOX',
        "subtitle": "Reverse-Sweep AM/FM ITC Radio Transceiver",
        "category": "EVP & Audio",
        "dailyRate": 24,
        "deposit": 60,
        "stock": 5,
        "threatRating": 5,
        "accentColor": "#22ff88",
        "metalTagline": "Sweeps 87.5–108 MHz at 250ms blast-beat cadence with 1/4\" amp out.",
        "description": (
            "Tactical gunmetal ITC communicator featuring dual Marshall-style knurled tuning dials "
            "that literally go to 11, an animated OLED spectral waveform display, and a 6.35mm line-out "
            "so you can pipe disembodied voices straight into a fuzz pedal or field recorder."
        ),
        "specs": {
            "Sweep Rate": "50ms – 350ms (Forward / Reverse)",
            "Bands": "FM 76–108 MHz / AM 520–1710 kHz",
            "Output": "Dual 3.5mm + 6.35mm Guitar Amp Jack",
            "Antenna": "Telescopic Chrome Whip w/ Beacon Tip",
        },
        "soundtrackPairing": "Mayhem — De Mysteriis Dom Sathanas",
        "overdriveLabel": "REVERSE SWEEP BLAST",
    },
    {
        "id": "eq-thermal-sls",
        "slug": "abyssal-thermal-sls",
        "modelKey": "thermal",
        "name": 'SLS-X "ABYSSAL RIG" THERMAL & LIDAR',
        "subtitle": "Infrared Thermal + Structured Light Skeleton Mapper",
        "category": "Optics & Thermal",
        "dailyRate": 42,
        "deposit": 120,
        "stock": 3,
        "threatRating": 5,
        "accentColor": "#ff5522",
        "metalTagline": "Spots -20°C cold pockets and maps skeletal apparitions in zero lux.",
        "description": (
            "Dual-handle iron cinema cage housing a ruby-coated germanium thermal lens, twin IR "
            "illuminator rings, and a top-mounted 3D skeletal depth mapper. Flip-out thermal OLED "
            "exposes phantom heat drains along the misty banks of the Menai Strait."
        ),
        "specs": {
            "Thermal Res": "384 × 288 VOx Uncooled Microbolometer",
            "Temp Range": "-20°C to +450°C (±0.05°C NETD)",
            "SLS Depth": "Structured IR Dot Cloud (15m range)",
            "Recording": "4K Raw + Thermal Overlay to Dual SD",
        },
        "soundtrackPairing": "Electric Wizard — Dopethrone",
        "overdriveLabel": "THERMAL + SLS LOCK",
    },
    {
        "id": "eq-rempod-iron",
        "slug": "iron-maiden-rempod",
        "modelKey": "rempod",
        "name": 'REM-POD "IRON MAIDEN" BEACON',
        "subtitle": "360° Radiating Static Field & Cold-Spot Alarm Tower",
        "category": "Perimeter Traps",
        "dailyRate": 32,
        "deposit": 85,
        "stock": 4,
        "threatRating": 5,
        "accentColor": "#c026d3",
        "metalTagline": "Wails like a feedback-drenched Sunn O))) stack when entities cross.",
        "description": (
            "Hexagonal cast-iron and tarnished brass proximity tower on spiked feet. Emits its own "
            "localized electromagnetic halo around a telescopic copper core; any spectral breach "
            "triggers sequential jewel-lens strobes and an unmistakable doom-octave harmonic alarm."
        ),
        "specs": {
            "Halo Radius": "Up to 2.5m 360° Radiating EM Field",
            "Temp Alert": "Rapid ±2.5°C Ambient Drop Trigger",
            "Indicators": "4 Directional Jewel-Lens Beacon Domes",
            "Audio Alarm": "Selectable Chime / Sub-Bass Drone",
        },
        "soundtrackPairing": "Sunn O))) — Black One",
        "overdriveLabel": "TRIGGER BREACH ALARM",
    },
    {
        "id": "eq-pentagrid-laser",
        "slug": "pentagrid-laser-matrix",
        "modelKey": "laser",
        "name": 'SLS-LASER "PENTAGRID" PROJECTOR',
        "subtitle": "532nm Emerald Spectral Matrix Emitter",
        "category": "Optics & Thermal",
        "dailyRate": 22,
        "deposit": 55,
        "stock": 6,
        "threatRating": 4,
        "accentColor": "#10ff70",
        "metalTagline": "Blankets stone crypts in 1,200 razor-sharp emerald laser points.",
        "description": (
            "CNC-milled billet aluminium emitter barrel ringed with power-tube cooling fins and a "
            "knurled brass diffraction lens. Clamp it onto a gravestone or ruin arch to project a "
            "wide-angle emerald dot matrix that exposes shadow figures slicing through the beams."
        ),
        "specs": {
            "Wavelength": "532nm Emerald Green (Class IIIR Safe)",
            "Grid Density": "1,200 Diffraction Nodes (75° spread)",
            "Mount": "Heavy Cast Tripod + Iron Clamp",
            "Runtime": "14 hrs Rechargeable Li-Ion Cell",
        },
        "soundtrackPairing": "Type O Negative — October Rust",
        "overdriveLabel": "IGNITE 532nm MATRIX",
    },
    {
        "id": "eq-evp-blacktape",
        "slug": "black-tape-parabolic-evp",
        "modelKey": "evp",
        "name": 'EVP-8 "BLACK TAPE" PARABOLIC RIG',
        "subtitle": "Sub-Bass Infrasound Parabolic Dish & Analog Reel Deck",
        "category": "EVP & Audio",
        "dailyRate": 28,
        "deposit": 90,
        "stock": 4,
        "threatRating": 4,
        "accentColor": "#f59e0b",
        "metalTagline": "Captures sub-20Hz dread and Class-A whispers straight onto ferric tape.",
        "description": (
            "Twin exposed brushed-steel tape reels paired with a smoked-acrylic directional parabolic "
            "dish and ultra-low-noise condenser capsule. Captures ghostly whispers 40 metres across "
            "misty churchyards — plus warm analog tape hiss ready for your band's next album intro."
        ),
        "specs": {
            "Freq Response": "12 Hz – 42 kHz (Infrasound Ready)",
            "Dish Gain": "+28 dB Acoustic Focus at 40m",
            "Media": "Dual-Reel Ferric Tape + 24-bit WAV Sync",
            "Noise Floor": "-129 dBu Ultra-Quiet Preamp",
        },
        "soundtrackPairing": "Bathory — Blood Fire Death",
        "overdriveLabel": "ENGAGE TAPE REELS",
    },
]

LOADOUT_BUNDLES: List[Dict[str, Any]] = [
    {
        "id": "bundle-solo-vigil",
        "name": "BLACK METAL SOLO VIGIL",
        "tagline": "Lean, frostbitten loadout for lone midnight walks along Church Island.",
        "equipmentSlugs": ["doomspike-emf", "necro-sweep-spiritbox"],
        "dailyRate": 36,
        "regularRate": 42,
        "badge": "SAVE 14%",
        "recommendedFor": "Solo hunters & late-night railway station vigils",
    },
    {
        "id": "bundle-doom-coven",
        "name": "FULL DOOM COVEN RIG",
        "tagline": "Every detector, laser matrix, and beacon to lock down a full ruin.",
        "equipmentSlugs": [
            "doomspike-emf",
            "necro-sweep-spiritbox",
            "abyssal-thermal-sls",
            "iron-maiden-rempod",
        ],
        "dailyRate": 96,
        "regularRate": 116,
        "badge": "MOST POPULAR • SAVE 17%",
        "recommendedFor": "Bands, crews of 3–5, and overnight Anglesey abbey lockdowns",
    },
    {
        "id": "bundle-blood-moon",
        "name": "MENAI STRAIT BLOOD MOON ARSENAL",
        "tagline": "All 6 forged instruments + waterproof corpse-paint cases. Total spectral dominance.",
        "equipmentSlugs": [
            "doomspike-emf",
            "necro-sweep-spiritbox",
            "abyssal-thermal-sls",
            "iron-maiden-rempod",
            "pentagrid-laser-matrix",
            "black-tape-parabolic-evp",
        ],
        "dailyRate": 135,
        "regularRate": 166,
        "badge": "FULL 6-RIG ARSENAL • SAVE 19%",
        "recommendedFor": "Documentary crews, touring bands & serious paranormal expeditions",
    },
]

HAUNTED_HOTSPOTS: List[Dict[str, Any]] = [
    {
        "id": "spot-church-island",
        "name": "St. Tysilio's Church (Church Island)",
        "welshName": "Ynys Tysilio — The Swellies",
        "distance": "1.4 miles from Forge Bunker",
        "coordinates": "53.2248° N, 4.1656° W",
        "threatSkulls": 9,
        "baselineEmf": "14.2 mG",
        "peakHour": "02:15 – 03:45 GMT",
        "anomalyType": "Tidal Apparitions & Disembodied Choir Chants",
        "lore": (
            "Reached only via a narrow stone causeway surrounded by the treacherous whirlpools of "
            "the Menai Strait. Renters consistently report freezing salt-mist pockets and low Welsh "
            "whispers captured on reverse-sweep spirit boxes between the mossy gravestones."
        ),
        "recommendedSlugs": ["necro-sweep-spiritbox", "black-tape-parabolic-evp", "doomspike-emf"],
        "soundtrack": "My Dying Bride — Turn Loose the Swans",
    },
    {
        "id": "spot-anglesey-column",
        "name": "Marquess of Anglesey's Column & Woods",
        "welshName": "Tŵr Marcwis Môn",
        "distance": "0.6 miles from Forge Bunker",
        "coordinates": "53.2211° N, 4.1852° W",
        "threatSkulls": 8,
        "baselineEmf": "21.8 mG",
        "peakHour": "00:30 – 02:30 GMT",
        "anomalyType": "Tall Shadow Figures & Rapid EMF Spikes",
        "lore": (
            "Rising 27 metres above the wooded ridge overlooking Llanfairpwllgwyngyll, the stone "
            "column casts jagged moonlight shadows through ancient oaks. Pentagrid laser sweeps "
            "around the base regularly break as bipedal silhouettes cross the beam."
        ),
        "recommendedSlugs": ["doomspike-emf", "pentagrid-laser-matrix"],
        "soundtrack": "Bathory — Hammerheart",
    },
    {
        "id": "spot-bryn-celli-ddu",
        "name": "Bryn Celli Ddu Passage Tomb",
        "welshName": "The Mound in the Dark Grove",
        "distance": "2.3 miles from Forge Bunker",
        "coordinates": "53.2076° N, 4.2361° W",
        "threatSkulls": 10,
        "baselineEmf": "33.6 mG",
        "peakHour": "03:00 – 04:15 GMT",
        "anomalyType": "17Hz Infrasound Dread & Extreme Cold Spots",
        "lore": (
            "A 5,000-year-old Neolithic burial chamber aligned with the summer solstice. Inside the "
            "stone passage, REM-Pods trigger in rhythmic pulses while thermal cameras record -8°C "
            "anomalies hovering directly beside the carved pillar stone."
        ),
        "recommendedSlugs": ["abyssal-thermal-sls", "iron-maiden-rempod", "black-tape-parabolic-evp"],
        "soundtrack": "Sunn O))) — Monoliths & Dimensions",
    },
    {
        "id": "spot-plas-newydd",
        "name": "Plas Newydd Foreshore & Bridge Arches",
        "welshName": "Glannau Plas Newydd",
        "distance": "1.1 miles from Forge Bunker",
        "coordinates": "53.2071° N, 4.2125° W",
        "threatSkulls": 7,
        "baselineEmf": "9.4 mG",
        "peakHour": "23:45 – 01:45 GMT",
        "anomalyType": "Phantom Boots & Residual Lantern Orbs",
        "lore": (
            "Where Victorian sea fog rolls beneath the towering stone arches of the Britannia Bridge. "
            "Heavy rhythmic bootsteps echo along the wet shoreline with no living soul in sight."
        ),
        "recommendedSlugs": ["abyssal-thermal-sls", "pentagrid-laser-matrix", "doomspike-emf"],
        "soundtrack": "Electric Wizard — Come My Fanatics",
    },
    {
        "id": "spot-station-platform",
        "name": "Llanfairpwllgwyngyll 58-Letter Platform",
        "welshName": "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch",
        "distance": "0.1 miles (Right outside our Bunker)",
        "coordinates": "53.2244° N, 4.2096° W",
        "threatSkulls": 6,
        "baselineEmf": "11.6 mG",
        "peakHour": "01:00 – 03:00 GMT",
        "anomalyType": "Phantom Steam Whistle & Class-A EVP",
        "lore": (
            "Once the last coastal express departs into the fog, the famous 58-letter signboard "
            "hums with static. Ideal warm-up shakedown before heading deeper into Anglesey."
        ),
        "recommendedSlugs": ["doomspike-emf", "necro-sweep-spiritbox"],
        "soundtrack": "Iron Maiden — Phantom of the Opera",
    },
]

RITUAL_ADDONS: Dict[str, Dict[str, Any]] = {
    "black-cells": {"name": "Extra 9V Black-Cell Pack (x4)", "price": 6},
    "corpse-case": {"name": "Waterproof Corpse-Paint Pelicase", "price": 10},
    "faraday-pouch": {"name": "Copper Faraday Phone Suppressor", "price": 5},
    "anglesey-salt": {"name": "Halen Môn Celtic Sea-Salt Perimeter Vial", "price": 4},
}

SEED_SIGHTINGS: List[Dict[str, Any]] = [
    {
        "id": "log-001",
        "hunterName": "Gareth 'Blastbeat' Pritchard",
        "bandOrCoven": "Môn Doom Syndicate",
        "location": "Bryn Celli Ddu Passage Tomb",
        "gearUsed": 'REM-POD "IRON MAIDEN" + SLS-X Thermal',
        "peakEmf": 48.2,
        "soundtrack": "Electric Wizard — Funeralopolis",
        "report": (
            "Placed the Iron Maiden REM-Pod right at the tomb mouth at 03:12. All 4 jewel beacons "
            "lit crimson simultaneously and thermal dropped 9°C in four seconds. Recorded a sub-bass "
            "groan that rattled my chest."
        ),
        "createdAt": "2026-11-16T03:44:00Z",
    },
    {
        "id": "log-002",
        "hunterName": "Nia Blackthorn",
        "bandOrCoven": "Coven of the Swellies",
        "location": "St. Tysilio's Church (Church Island)",
        "gearUsed": 'SBM-7 "NECRO-SWEEP" + EVP-8 Black Tape',
        "peakEmf": 31.7,
        "soundtrack": "Bathory — Blood Fire Death",
        "report": (
            "Ran the Necro-Sweep through a portable overdrive amp by the tide wall. Asked who walks "
            "the causeway and got three crystal-clear syllables in old Welsh back on ferric tape. "
            "Sampled it straight into our EP intro."
        ),
        "createdAt": "2026-11-12T02:19:00Z",
    },
    {
        "id": "log-003",
        "hunterName": "Iwan 'Doomhammer' Evans",
        "bandOrCoven": "Snowdonia Crypt Dwellers",
        "location": "Marquess of Anglesey's Column & Woods",
        "gearUsed": 'SLS-LASER "PENTAGRID" + K-II Doomspike',
        "peakEmf": 62.4,
        "soundtrack": "Mayhem — Freezing Moon",
        "report": (
            "Blanketed the lower stone arch in emerald laser dots. Halfway through our vigil a "
            "seven-foot shadow silhouette walked cleanly across 400 grid points while the Doomspike "
            "pegged solid blood-red."
        ),
        "createdAt": "2026-11-08T01:08:00Z",
    },
]


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class BookingItemInput(BaseModel):
    slug: str
    quantity: int = Field(default=1, ge=1, le=10)


class BookingCreate(BaseModel):
    hunterName: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=4, max_length=160)
    bandOrCoven: Optional[str] = Field(default="", max_length=120)
    pickupDate: str = Field(..., min_length=8, max_length=32)
    nights: int = Field(default=1, ge=1, le=14)
    pickupLocation: str = Field(
        default="Forge Bunker (Behind Llanfairpwll Station)",
        max_length=160,
    )
    targetHotspot: Optional[str] = Field(default="", max_length=160)
    items: List[BookingItemInput] = Field(..., min_length=1)
    addonIds: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(default="", max_length=500)


class SightingCreate(BaseModel):
    hunterName: str = Field(..., min_length=2, max_length=100)
    bandOrCoven: Optional[str] = Field(default="Lone Wolf", max_length=100)
    location: str = Field(..., min_length=2, max_length=160)
    gearUsed: str = Field(..., min_length=2, max_length=160)
    peakEmf: float = Field(default=12.5, ge=0.0, le=999.9)
    soundtrack: Optional[str] = Field(default="Black Sabbath — Paranoid", max_length=140)
    report: str = Field(..., min_length=10, max_length=1000)


# ---------------------------------------------------------------------------
# Database Layer (MongoDB via Motor with Graceful In-Memory Fallback)
# ---------------------------------------------------------------------------

class StorageState:
    def __init__(self) -> None:
        self.client: Any = None
        self.db: Any = None
        self.mode: str = "memory"
        self.bookings_mem: List[Dict[str, Any]] = []
        self.sightings_mem: List[Dict[str, Any]] = list(SEED_SIGHTINGS)


store = StorageState()


async def init_storage() -> None:
    mongo_url = os.environ.get("MONGO_URL", "").strip()
    db_name = os.environ.get("DB_NAME", "llanfair_spectre_forge").strip()
    if mongo_url and AsyncIOMotorClient is not None:
        try:
            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
            await client.admin.command("ping")
            store.client = client
            store.db = client[db_name]
            store.mode = "mongodb"
            logger.info("Connected to MongoDB database '%s'", db_name)
            # Seed sightings once if collection is empty
            count = await store.db.sightings.count_documents({})
            if count == 0:
                await store.db.sightings.insert_many([dict(s) for s in SEED_SIGHTINGS])
                logger.info("Seeded %d initial Llanfairpwllgwyngyll field logs", len(SEED_SIGHTINGS))
            return
        except Exception as exc:
            logger.warning("MongoDB unreachable (%s); using in-memory fallback store.", exc)
    store.mode = "memory"
    logger.info("Running in in-memory storage mode.")


async def close_storage() -> None:
    if store.client is not None:
        store.client.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_storage()
    yield
    await close_storage()


# ---------------------------------------------------------------------------
# App & Router Setup (All Routes Prefixed with /api for Emergent.sh Ingress)
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Llanfair Spectre Forge API",
    description="Doom-grade ghost hunting equipment rental API for Llanfairpwllgwyngyll, Anglesey.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins_env = os.environ.get("CORS_ORIGINS", "*").strip()
allow_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

EQUIPMENT_BY_SLUG = {item["slug"]: item for item in EQUIPMENT_CATALOG}


def generate_booking_code() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PWLL-666-{suffix}"


@api_router.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "forged",
        "service": "Llanfair Spectre Forge",
        "village": "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch",
        "storage": store.mode,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/equipment")
async def list_equipment(category: Optional[str] = Query(default=None)) -> Dict[str, Any]:
    items = EQUIPMENT_CATALOG
    if category and category.lower() != "all":
        items = [e for e in items if e["category"].lower() == category.lower()]
    return {"items": items, "count": len(items), "addons": RITUAL_ADDONS}


@api_router.get("/equipment/{slug}")
async def get_equipment(slug: str) -> Dict[str, Any]:
    item = EQUIPMENT_BY_SLUG.get(slug)
    if not item:
        raise HTTPException(status_code=404, detail=f"Equipment '{slug}' not found in the Forge.")
    return item


@api_router.get("/bundles")
async def list_bundles() -> Dict[str, Any]:
    return {"bundles": LOADOUT_BUNDLES}


@api_router.get("/hotspots")
async def list_hotspots() -> Dict[str, Any]:
    return {"hotspots": HAUNTED_HOTSPOTS}


@api_router.get("/bookings")
async def list_bookings(
    code: Optional[str] = Query(default=None),
    email: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    if store.mode == "mongodb" and store.db is not None:
        query: Dict[str, Any] = {}
        if code:
            query["bookingCode"] = code.strip().upper()
        if email:
            query["email"] = email.strip().lower()
        cursor = store.db.bookings.find(query, {"_id": 0}).sort("createdAt", -1).limit(50)
        bookings = await cursor.to_list(length=50)
    else:
        bookings = list(store.bookings_mem)
        if code:
            bookings = [b for b in bookings if b["bookingCode"].upper() == code.strip().upper()]
        if email:
            bookings = [b for b in bookings if b["email"].lower() == email.strip().lower()]
        bookings.sort(key=lambda x: x["createdAt"], reverse=True)
    return {"bookings": bookings, "count": len(bookings)}


@api_router.post("/bookings", status_code=201)
async def create_booking(payload: BookingCreate) -> Dict[str, Any]:
    resolved_items: List[Dict[str, Any]] = []
    equipment_subtotal = 0
    total_deposit = 0

    for entry in payload.items:
        eq = EQUIPMENT_BY_SLUG.get(entry.slug)
        if not eq:
            raise HTTPException(status_code=400, detail=f"Unknown equipment slug: {entry.slug}")
        line_daily = eq["dailyRate"] * entry.quantity
        line_total = line_daily * payload.nights
        equipment_subtotal += line_total
        total_deposit += eq["deposit"] * entry.quantity
        resolved_items.append(
            {
                "slug": eq["slug"],
                "name": eq["name"],
                "quantity": entry.quantity,
                "dailyRate": eq["dailyRate"],
                "lineTotal": line_total,
            }
        )

    # 15% Riff Lord multi-night discount for 3+ nights
    discount = round(equipment_subtotal * 0.15, 2) if payload.nights >= 3 else 0.0

    resolved_addons: List[Dict[str, Any]] = []
    addons_total = 0
    for addon_id in payload.addonIds:
        addon = RITUAL_ADDONS.get(addon_id)
        if addon:
            addons_total += addon["price"]
            resolved_addons.append({"id": addon_id, "name": addon["name"], "price": addon["price"]})

    grand_total = round(equipment_subtotal - discount + addons_total, 2)

    booking_doc: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "bookingCode": generate_booking_code(),
        "status": "CONFIRMED",
        "hunterName": payload.hunterName.strip(),
        "email": payload.email.strip().lower(),
        "bandOrCoven": (payload.bandOrCoven or "").strip(),
        "pickupDate": payload.pickupDate.strip(),
        "nights": payload.nights,
        "pickupLocation": payload.pickupLocation.strip(),
        "targetHotspot": (payload.targetHotspot or "").strip(),
        "items": resolved_items,
        "addons": resolved_addons,
        "subtotal": equipment_subtotal,
        "riffLordDiscount": discount,
        "addonsTotal": addons_total,
        "totalGbp": grand_total,
        "refundableDepositGbp": total_deposit,
        "notes": (payload.notes or "").strip(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    if store.mode == "mongodb" and store.db is not None:
        await store.db.bookings.insert_one(dict(booking_doc))
    else:
        store.bookings_mem.insert(0, booking_doc)

    return {"booking": booking_doc}


@api_router.delete("/bookings/{booking_code}")
async def cancel_booking(booking_code: str) -> Dict[str, Any]:
    normalized = booking_code.strip().upper()
    if store.mode == "mongodb" and store.db is not None:
        res = await store.db.bookings.delete_one({"bookingCode": normalized})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Booking manifest not found.")
    else:
        before = len(store.bookings_mem)
        store.bookings_mem = [b for b in store.bookings_mem if b["bookingCode"] != normalized]
        if len(store.bookings_mem) == before:
            raise HTTPException(status_code=404, detail="Booking manifest not found.")
    return {"cancelled": normalized}


@api_router.get("/sightings")
async def list_sightings() -> Dict[str, Any]:
    if store.mode == "mongodb" and store.db is not None:
        cursor = store.db.sightings.find({}, {"_id": 0}).sort("createdAt", -1).limit(40)
        sightings = await cursor.to_list(length=40)
    else:
        sightings = sorted(store.sightings_mem, key=lambda x: x["createdAt"], reverse=True)
    return {"sightings": sightings, "count": len(sightings)}


@api_router.post("/sightings", status_code=201)
async def create_sighting(payload: SightingCreate) -> Dict[str, Any]:
    doc: Dict[str, Any] = {
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "hunterName": payload.hunterName.strip(),
        "bandOrCoven": (payload.bandOrCoven or "Lone Wolf").strip(),
        "location": payload.location.strip(),
        "gearUsed": payload.gearUsed.strip(),
        "peakEmf": round(payload.peakEmf, 1),
        "soundtrack": (payload.soundtrack or "Black Sabbath — Paranoid").strip(),
        "report": payload.report.strip(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    if store.mode == "mongodb" and store.db is not None:
        await store.db.sightings.insert_one(dict(doc))
    else:
        store.sightings_mem.insert(0, doc)
    return {"sighting": doc}


app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)

"""Llanfair Spectre Forge API: FastAPI app wiring (all routes under /api)."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from fastapi import APIRouter, FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from routers import bookings, catalog, intel, map_tiles, sightings  # noqa: E402
from storage import close_storage, init_storage  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_storage()
    yield
    await close_storage()


app = FastAPI(
    title="Llanfair Spectre Forge API",
    description="Doom-grade ghost hunting equipment rental API for Llanfairpwllgwyngyll, Anglesey.",
    version="1.1.0",
    lifespan=lifespan,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url=None,
)

allow_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
for module in (catalog, bookings, sightings, intel, map_tiles):
    api_router.include_router(module.router)
app.include_router(api_router)

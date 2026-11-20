"""MongoDB storage (Motor) with an in-memory fallback when Mongo is unreachable."""

import logging
import os
from typing import Any, Dict, List

from seed import SEED_SIGHTINGS

logger = logging.getLogger("llanfair_spectre_forge.storage")

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except ImportError:  # pragma: no cover
    AsyncIOMotorClient = None  # type: ignore


class StorageState:
    def __init__(self) -> None:
        self.client: Any = None
        self.db: Any = None
        self.mode: str = "memory"
        self.bookings_mem: List[Dict[str, Any]] = []
        self.sightings_mem: List[Dict[str, Any]] = [dict(s) for s in SEED_SIGHTINGS]

    @property
    def online(self) -> bool:
        return self.mode == "mongodb" and self.db is not None


store = StorageState()


async def init_storage() -> None:
    mongo_url = os.environ.get("MONGO_URL", "").strip()
    db_name = os.environ.get("DB_NAME", "").strip()
    if mongo_url and db_name and AsyncIOMotorClient is not None:
        try:
            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
            await client.admin.command("ping")
            store.client = client
            store.db = client[db_name]
            store.mode = "mongodb"
            logger.info("Connected to MongoDB database '%s'", db_name)
            await store.db.bookings.create_index("bookingCode", unique=True)
            for seed in SEED_SIGHTINGS:
                await store.db.sightings.update_one({"id": seed["id"]}, {"$set": dict(seed)}, upsert=True)
            return
        except Exception as exc:  # noqa: BLE001
            logger.warning("MongoDB unreachable (%s); using in-memory store.", exc)
    store.mode = "memory"
    logger.info("Running in in-memory storage mode.")


async def close_storage() -> None:
    if store.client is not None:
        store.client.close()

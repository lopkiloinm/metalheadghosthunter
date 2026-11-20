import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query

from models import Booking, BookingCreate
from pricing import generate_booking_code, price_booking
from storage import store

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("")
async def list_bookings(
    code: Optional[str] = Query(default=None),
    email: Optional[str] = Query(default=None),
    codes: Optional[str] = Query(default=None, description="Comma-separated booking codes"),
) -> Dict[str, Any]:
    code_list = [c.strip().upper() for c in (codes or "").split(",") if c.strip()]
    if code:
        code_list.append(code.strip().upper())
    email_norm = email.strip().lower() if email else None
    if not code_list and not email_norm:
        return {"bookings": [], "count": 0}

    if store.online:
        query: Dict[str, Any] = {}
        if code_list:
            query["bookingCode"] = {"$in": code_list}
        if email_norm:
            query["email"] = email_norm
        docs = await store.db.bookings.find(query).sort("createdAt", -1).limit(50).to_list(length=50)
    else:
        docs = [
            b
            for b in store.bookings_mem
            if (not code_list or b["bookingCode"] in code_list) and (not email_norm or b["email"] == email_norm)
        ]
        docs.sort(key=lambda x: x["createdAt"], reverse=True)
    bookings = [Booking.from_mongo(d).model_dump() for d in docs]
    return {"bookings": bookings, "count": len(bookings)}


async def code_exists(code: str) -> bool:
    if store.online:
        return await store.db.bookings.count_documents({"bookingCode": code}, limit=1) > 0
    return any(b["bookingCode"] == code for b in store.bookings_mem)


async def unique_booking_code() -> str:
    while True:
        code = generate_booking_code()
        if not await code_exists(code):
            return code


@router.post("", status_code=201)
async def create_booking(payload: BookingCreate) -> Dict[str, Any]:
    booking = Booking(
        id=str(uuid.uuid4()),
        bookingCode=await unique_booking_code(),
        status="CONFIRMED",
        hunterName=payload.hunterName.strip(),
        email=payload.email.strip().lower(),
        bandOrCoven=(payload.bandOrCoven or "").strip(),
        pickupDate=payload.pickupDate.isoformat(),
        returnDate=payload.returnDate.isoformat() if payload.returnDate else None,
        nights=payload.nights,
        pickupLocation=payload.pickupLocation.strip(),
        targetHotspot=(payload.targetHotspot or "").strip(),
        notes=(payload.notes or "").strip(),
        createdAt=datetime.now(timezone.utc).isoformat(),
        **price_booking(payload),
    )
    if store.online:
        await store.db.bookings.insert_one(booking.to_mongo())
    else:
        store.bookings_mem.insert(0, booking.to_mongo())
    return {"booking": booking.model_dump()}


@router.delete("/{booking_code}")
async def cancel_booking(booking_code: str) -> Dict[str, Any]:
    normalized = booking_code.strip().upper()
    if store.online:
        res = await store.db.bookings.delete_one({"bookingCode": normalized})
        found = res.deleted_count > 0
    else:
        before = len(store.bookings_mem)
        store.bookings_mem = [b for b in store.bookings_mem if b["bookingCode"] != normalized]
        found = len(store.bookings_mem) < before
    if not found:
        raise HTTPException(status_code=404, detail="Booking manifest not found.")
    return {"cancelled": normalized}

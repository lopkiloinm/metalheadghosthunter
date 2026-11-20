"""Rental pricing: line totals, 15% multi-night discount (3+ nights), add-ons and deposits."""

import random
import string
from typing import Any, Dict, List

from fastapi import HTTPException

from models import BookingCreate
from seed import EQUIPMENT_BY_SLUG, RITUAL_ADDONS

MULTI_NIGHT_THRESHOLD = 3
MULTI_NIGHT_DISCOUNT = 0.15


def generate_booking_code() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PWLL-666-{suffix}"


def price_booking(payload: BookingCreate) -> Dict[str, Any]:
    items: List[Dict[str, Any]] = []
    subtotal = 0.0
    deposit = 0.0
    for entry in payload.items:
        eq = EQUIPMENT_BY_SLUG.get(entry.slug)
        if not eq:
            raise HTTPException(status_code=400, detail=f"Unknown equipment slug: {entry.slug}")
        line_total = eq["dailyRate"] * entry.quantity * payload.nights
        subtotal += line_total
        deposit += eq["deposit"] * entry.quantity
        items.append(
            {
                "slug": eq["slug"],
                "name": eq["name"],
                "quantity": entry.quantity,
                "dailyRate": eq["dailyRate"],
                "lineTotal": line_total,
            }
        )

    discount = round(subtotal * MULTI_NIGHT_DISCOUNT, 2) if payload.nights >= MULTI_NIGHT_THRESHOLD else 0.0
    addons = [
        {"id": addon_id, "name": RITUAL_ADDONS[addon_id]["name"], "price": RITUAL_ADDONS[addon_id]["price"]}
        for addon_id in payload.addonIds
        if addon_id in RITUAL_ADDONS
    ]
    addons_total = sum(a["price"] for a in addons)
    return {
        "items": items,
        "addons": addons,
        "subtotal": subtotal,
        "riffLordDiscount": discount,
        "addonsTotal": addons_total,
        "totalGbp": round(subtotal - discount + addons_total, 2),
        "refundableDepositGbp": deposit,
    }

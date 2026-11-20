"""Pydantic request/response models."""

from datetime import date, timedelta
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MongoDocument(BaseModel):
    """Base for stored documents: drops Mongo's ObjectId `_id` and keeps our string `id`."""

    model_config = ConfigDict(extra="ignore")

    id: str

    @classmethod
    def from_mongo(cls, doc: Dict[str, Any]):
        data = {k: v for k, v in doc.items() if k != "_id"}
        return cls(**data)

    def to_mongo(self) -> Dict[str, Any]:
        return self.model_dump()


class BookingItemInput(BaseModel):
    slug: str
    quantity: int = Field(default=1, ge=1, le=10)


class BookingCreate(BaseModel):
    hunterName: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=4, max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    bandOrCoven: Optional[str] = Field(default="", max_length=120)
    pickupDate: date
    returnDate: Optional[date] = None
    nights: int = Field(default=1, ge=1, le=14)
    pickupLocation: str = Field(default="Forge Bunker (Behind Llanfairpwll Station)", max_length=160)
    targetHotspot: Optional[str] = Field(default="", max_length=160)
    items: List[BookingItemInput] = Field(..., min_length=1)
    addonIds: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(default="", max_length=500)

    @model_validator(mode="after")
    def sync_nights_with_dates(self):
        # One day of slack so a client's local "today" is accepted across timezones.
        if self.pickupDate < date.today() - timedelta(days=1):
            raise ValueError("pickupDate cannot be in the past")
        if self.returnDate is not None:
            delta = (self.returnDate - self.pickupDate).days
            if delta < 1:
                raise ValueError("returnDate must be after pickupDate")
            if delta > 14:
                raise ValueError("Rentals are limited to 14 nights")
            self.nights = delta
        return self


class BookingLine(BaseModel):
    slug: str
    name: str
    quantity: int
    dailyRate: float
    lineTotal: float


class BookingAddon(BaseModel):
    id: str
    name: str
    price: float


class Booking(MongoDocument):
    bookingCode: str
    status: str
    hunterName: str
    email: str
    bandOrCoven: str = ""
    pickupDate: str
    returnDate: Optional[str] = None
    nights: int
    pickupLocation: str
    targetHotspot: str = ""
    items: List[BookingLine]
    addons: List[BookingAddon] = []
    subtotal: float
    riffLordDiscount: float
    addonsTotal: float
    totalGbp: float
    refundableDepositGbp: float
    notes: str = ""
    createdAt: str


class SightingCreate(BaseModel):
    hunterName: str = Field(..., min_length=2, max_length=100)
    bandOrCoven: Optional[str] = Field(default="Lone Wolf", max_length=100)
    location: str = Field(..., min_length=2, max_length=160)
    gearUsed: str = Field(..., min_length=2, max_length=160)
    peakEmf: float = Field(default=12.5, ge=0.0, le=999.9)
    soundtrack: Optional[str] = Field(default="Black Sabbath — Paranoid", max_length=140)
    report: str = Field(..., min_length=10, max_length=1000)
    hotspotId: Optional[str] = Field(default=None, max_length=60)
    lat: Optional[float] = Field(default=None, ge=53.15, le=53.27)
    lng: Optional[float] = Field(default=None, ge=-4.32, le=-4.10)

    @model_validator(mode="after")
    def pin_needs_both_coords(self):
        if (self.lat is None) != (self.lng is None):
            raise ValueError("Provide both lat and lng for a map pin")
        return self


class Sighting(MongoDocument):
    hunterName: str
    bandOrCoven: str
    location: str
    gearUsed: str
    peakEmf: float
    soundtrack: str = ""
    report: str
    hotspotId: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: str


class ForgeLocation(BaseModel):
    name: str
    address: str
    lat: float
    lng: float


class WalkingRoute(BaseModel):
    id: str
    name: str
    hotspotIds: List[str]
    color: str
    distanceKm: float
    distanceMiles: float
    walkMinutes: int
    path: List[List[float]]


class RoutesResponse(BaseModel):
    forge: ForgeLocation
    routes: List[WalkingRoute]

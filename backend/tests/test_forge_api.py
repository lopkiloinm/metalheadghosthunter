# Llanfair Spectre Forge API regression tests (catalog, bookings, sightings, openapi)
import os
from datetime import date, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
CREATED_CODES = []
FUTURE = date(2027, 1, 10)


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    yield sess
    for code in CREATED_CODES:
        sess.delete(f"{API}/bookings/{code}")


def booking_payload(nights=4, **kw):
    p = {
        "hunterName": "TEST_Hunter",
        "email": "test_hunter@example.com",
        "pickupDate": FUTURE.isoformat(),
        "returnDate": (FUTURE + timedelta(days=nights)).isoformat(),
        "items": [{"slug": EQ[0]["slug"], "quantity": 1}],
    }
    p.update(kw)
    return p


EQ = requests.get(f"{API}/equipment").json()["items"]


# Catalog / openapi
class TestCatalog:
    def test_openapi(self, s):
        r = s.get(f"{API}/openapi.json")
        assert r.status_code == 200
        assert "/api/bookings" in r.json()["paths"]

    def test_health(self, s):
        r = s.get(f"{API}/health")
        assert r.status_code == 200 and r.json()["status"] == "forged"
        print("storage:", r.json()["storage"])

    def test_equipment_count(self, s):
        d = s.get(f"{API}/equipment").json()
        assert d["count"] == 6 and len(d["items"]) == 6
        for it in d["items"]:
            assert it["slug"] and it["name"] and isinstance(it["dailyRate"], (int, float))

    def test_equipment_filter_and_detail(self, s):
        cat = EQ[0]["category"]
        d = s.get(f"{API}/equipment", params={"category": cat}).json()
        assert d["count"] >= 1 and all(i["category"] == cat for i in d["items"])
        assert s.get(f"{API}/equipment/{EQ[0]['slug']}").json()["slug"] == EQ[0]["slug"]
        assert s.get(f"{API}/equipment/nope-xyz").status_code == 404

    def test_bundles_hotspots(self, s):
        assert len(s.get(f"{API}/bundles").json()["bundles"]) == 3
        assert len(s.get(f"{API}/hotspots").json()["hotspots"]) == 5


# Bookings
class TestBookings:
    def test_create_discount_3plus(self, s):
        r = s.post(f"{API}/bookings", json=booking_payload(nights=4))
        assert r.status_code == 201, r.text
        b = r.json()["booking"]
        CREATED_CODES.append(b["bookingCode"])
        assert b["bookingCode"].startswith("PWLL-666-") and len(b["bookingCode"]) == 13
        assert b["nights"] == 4
        sub = EQ[0]["dailyRate"] * 4
        assert b["subtotal"] == sub
        assert b["riffLordDiscount"] == round(sub * 0.15, 2)
        assert b["totalGbp"] == round(sub - round(sub * 0.15, 2), 2)
        assert "_id" not in b

    def test_create_no_discount_2_nights(self, s):
        r = s.post(f"{API}/bookings", json=booking_payload(nights=2, nights_ignored=1))
        assert r.status_code == 201
        b = r.json()["booking"]
        CREATED_CODES.append(b["bookingCode"])
        assert b["nights"] == 2 and b["riffLordDiscount"] == 0

    def test_return_before_pickup_422(self, s):
        p = booking_payload()
        p["returnDate"] = p["pickupDate"]
        assert s.post(f"{API}/bookings", json=p).status_code == 422
        p["returnDate"] = (FUTURE - timedelta(days=1)).isoformat()
        assert s.post(f"{API}/bookings", json=p).status_code == 422

    def test_invalid_email_name_items(self, s):
        assert s.post(f"{API}/bookings", json=booking_payload(email="bad")).status_code == 422
        assert s.post(f"{API}/bookings", json=booking_payload(hunterName="A")).status_code == 422
        assert s.post(f"{API}/bookings", json=booking_payload(items=[])).status_code == 422
        assert s.post(f"{API}/bookings", json=booking_payload(items=[{"slug": "nope"}])).status_code == 400

    def test_past_pickup_date(self, s):
        # Requirement: pickup must be today or future. Report-only check.
        p = booking_payload()
        p["pickupDate"] = "2020-01-01"
        p["returnDate"] = "2020-01-03"
        r = s.post(f"{API}/bookings", json=p)
        if r.status_code == 201:
            CREATED_CODES.append(r.json()["booking"]["bookingCode"])
        assert r.status_code == 422, f"past pickup accepted: {r.status_code}"

    def test_get_by_codes_and_email(self, s):
        codes = []
        for _ in range(2):
            b = s.post(f"{API}/bookings", json=booking_payload()).json()["booking"]
            CREATED_CODES.append(b["bookingCode"])
            codes.append(b["bookingCode"])
        d = s.get(f"{API}/bookings", params={"codes": ",".join(codes)}).json()
        assert sorted(x["bookingCode"] for x in d["bookings"]) == sorted(codes)
        d = s.get(f"{API}/bookings", params={"code": codes[0].lower()}).json()
        assert d["count"] == 1
        d = s.get(f"{API}/bookings", params={"email": "TEST_HUNTER@example.com"}).json()
        assert d["count"] >= 2

    def test_delete_then_404(self, s):
        b = s.post(f"{API}/bookings", json=booking_payload()).json()["booking"]
        code = b["bookingCode"]
        assert s.delete(f"{API}/bookings/{code}").status_code == 200
        assert s.get(f"{API}/bookings", params={"code": code}).json()["count"] == 0
        assert s.delete(f"{API}/bookings/{code}").status_code == 404


# Field logs
class TestSightings:
    def test_list_and_create_first(self, s):
        d = s.get(f"{API}/sightings").json()
        assert d["count"] >= 3
        r = s.post(f"{API}/sightings", json={
            "hunterName": "TEST_Logger", "location": "TEST loc", "gearUsed": EQ[0]["name"],
            "peakEmf": 42.25, "report": "TEST_ cold spot and whispering in the bridge"})
        assert r.status_code == 201
        new = r.json()["sighting"]
        print("CREATED_SIGHTING", new["id"])
        try:
            assert new["bandOrCoven"] == "Lone Wolf"
            assert s.get(f"{API}/sightings").json()["sightings"][0]["id"] == new["id"]
        finally:
            # No DELETE endpoint: remove only the sighting this test created, via Mongo.
            from pymongo import MongoClient
            env = dict(l.strip().split("=", 1) for l in open("/app/backend/.env") if "=" in l)
            MongoClient(env["MONGO_URL"].strip('"'))[env["DB_NAME"].strip('"')].sightings.delete_one({"id": new["id"]})

    def test_sighting_validation(self, s):
        r = s.post(f"{API}/sightings", json={"hunterName": "TEST_X", "location": "ab", "gearUsed": "ab", "report": "short"})
        assert r.status_code == 422

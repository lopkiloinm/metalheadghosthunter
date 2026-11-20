# Map of the Restless: /api/routes, hotspot coords, sighting pins (iteration_3)
import math
import os

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def _mongo_env():
    env = {}
    with open("/app/backend/.env") as fh:
        for line in fh:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                env[k] = v.strip('"')
    return env


@pytest.fixture(scope="module")
def created_ids():
    ids = []
    yield ids
    if ids:
        env = _mongo_env()
        db = MongoClient(env["MONGO_URL"])[env["DB_NAME"]]
        db.sightings.delete_many({"id": {"$in": ids}})


def _metres(a_lat, a_lng, b_lat, b_lng):
    dy = (a_lat - b_lat) * 111320
    dx = (a_lng - b_lng) * 111320 * math.cos(math.radians(a_lat))
    return math.hypot(dx, dy)


def _payload(**extra):
    base = {
        "hunterName": "TEST_MapHunter",
        "location": "Bryn Celli Ddu",
        "gearUsed": "TEST gear rig",
        "peakEmf": 22.2,
        "report": "TEST_ cold spot and whispering near the cairn",
    }
    base.update(extra)
    return base


# Routes endpoint
class TestRoutes:
    def test_routes_shape(self):
        r = requests.get(f"{API}/routes", timeout=20)
        assert r.status_code == 200
        d = r.json()
        f = d["forge"]
        for k in ("name", "address", "lat", "lng"):
            assert k in f
        assert 53.19 <= f["lat"] <= 53.23 and -4.25 <= f["lng"] <= -4.16
        assert len(d["routes"]) == 5
        for rt in d["routes"]:
            for k in ("id", "name", "hotspotIds", "color", "distanceKm", "distanceMiles", "walkMinutes", "path"):
                assert k in rt, k
            assert len(rt["path"]) > 10
            assert all(len(p) == 2 for p in rt["path"])
            assert rt["distanceKm"] > 0 and rt["walkMinutes"] > 0
            assert abs(rt["distanceMiles"] - rt["distanceKm"] * 0.621371) < 0.1
            assert isinstance(rt["hotspotIds"], list) and rt["hotspotIds"]

    def test_routes_hotspot_ids_valid(self):
        hs = {h["id"] for h in requests.get(f"{API}/hotspots", timeout=20).json()["hotspots"]}
        for rt in requests.get(f"{API}/routes", timeout=20).json()["routes"]:
            assert set(rt["hotspotIds"]) <= hs

    def test_openapi_lists_routes(self):
        r = requests.get(f"{API}/openapi.json", timeout=20)
        assert r.status_code == 200
        assert "/api/routes" in r.json()["paths"]


# Coordinates on seeded data
class TestCoords:
    def test_hotspots_coords(self):
        hs = requests.get(f"{API}/hotspots", timeout=20).json()["hotspots"]
        assert len(hs) == 5
        for h in hs:
            assert isinstance(h["lat"], (int, float)) and isinstance(h["lng"], (int, float))
            assert 53.19 <= h["lat"] <= 53.23, h
            assert -4.25 <= h["lng"] <= -4.16, h

    def test_seeded_sightings_coords(self):
        s = {x["id"]: x for x in requests.get(f"{API}/sightings", timeout=20).json()["sightings"]}
        for sid in ("log-001", "log-002", "log-003"):
            assert sid in s
            assert isinstance(s[sid]["lat"], float) and isinstance(s[sid]["lng"], float)


# Sighting pin resolution
class TestPins:
    def test_hotspot_pin(self, created_ids):
        hs = {h["id"]: h for h in requests.get(f"{API}/hotspots", timeout=20).json()["hotspots"]}
        spot = hs["spot-bryn-celli-ddu"]
        r = requests.post(f"{API}/sightings", json=_payload(hotspotId="spot-bryn-celli-ddu"), timeout=20)
        assert r.status_code == 201
        s = r.json()["sighting"]
        created_ids.append(s["id"])
        assert s["hotspotId"] == "spot-bryn-celli-ddu"
        assert _metres(s["lat"], s["lng"], spot["lat"], spot["lng"]) < 100
        got = {x["id"]: x for x in requests.get(f"{API}/sightings", timeout=20).json()["sightings"]}
        assert got[s["id"]]["lat"] == s["lat"]

    def test_exact_pin(self, created_ids):
        r = requests.post(f"{API}/sightings", json=_payload(lat=53.21234, lng=-4.20111), timeout=20)
        assert r.status_code == 201
        s = r.json()["sighting"]
        created_ids.append(s["id"])
        assert s["lat"] == 53.21234 and s["lng"] == -4.20111

    def test_lat_without_lng(self):
        r = requests.post(f"{API}/sightings", json=_payload(lat=53.21), timeout=20)
        assert r.status_code == 422

    def test_out_of_range_lat(self):
        r = requests.post(f"{API}/sightings", json=_payload(lat=51.5, lng=-4.2), timeout=20)
        assert r.status_code == 422

    def test_out_of_range_lng(self):
        r = requests.post(f"{API}/sightings", json=_payload(lat=53.21, lng=0.1), timeout=20)
        assert r.status_code == 422

    def test_no_pin(self, created_ids):
        r = requests.post(f"{API}/sightings", json=_payload(), timeout=20)
        assert r.status_code == 201
        s = r.json()["sighting"]
        created_ids.append(s["id"])
        assert s["lat"] is None and s["lng"] is None and s["hotspotId"] is None

    def test_unknown_hotspot_no_pin(self, created_ids):
        r = requests.post(f"{API}/sightings", json=_payload(hotspotId="spot-nope"), timeout=20)
        assert r.status_code == 201
        s = r.json()["sighting"]
        created_ids.append(s["id"])
        assert s["lat"] is None and s["hotspotId"] is None

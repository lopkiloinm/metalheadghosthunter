import os, uuid
import httpx

BASE = "http://localhost:8001/api"
KEYS = [k for k in (os.environ.get("YDC_API_KEY", ""), os.environ.get("CARTO_API_KEY", "")) if k]


def test_intel_search_happy_and_cache(client):
    r = client.post("/intel/search", json={"query": "Beaumaris Gaol"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert 0 < len(d["results"]) <= 6
    for it in d["results"]:
        assert it["title"] and it["url"].startswith("http") and "source" in it
    r2 = client.post("/intel/search", json={"query": "Beaumaris Gaol"})
    assert r2.json().get("cached") is True, r2.json().keys()


def test_intel_validation_short(client):
    r = client.post("/intel/search", json={"query": "a"})
    assert r.status_code in (400, 422), r.status_code


def test_intel_nonsense_empty(client):
    q = "tscheck-zzqxv-" + uuid.uuid4().hex
    r = client.post("/intel/search", json={"query": q})
    assert r.status_code == 200, r.text
    assert r.json()["results"] == []


def test_map_tiles_image(client):
    r = client.get("/map/tiles/12/2023/1325.png")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/")


def test_keys_not_leaked(client):
    assert KEYS, "keys not present in test env"
    bodies = []
    for m, p, j in [("POST", "/intel/search", {"query": "Beaumaris Gaol"}), ("GET", "/map/status", None),
                    ("GET", "/map/tiles/12/2023/1325.png", None), ("GET", "/hotspots", None), ("GET", "/routes", None)]:
        r = client.request(m, p, json=j)
        bodies.append(r.content + str(dict(r.headers)).encode())
    for k in KEYS:
        assert all(k.encode() not in b for b in bodies)


def test_routes_and_sightings(client):
    routes = client.get("/routes").json()
    assert routes
    s = client.get("/sightings").json()
    assert s

# Map tile proxy (CARTO via backend) + status endpoint + key-leak checks
import os
import random
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
LOCAL = "http://localhost:8001"
KEY = os.environ.get("CARTO_API_KEY", "")


class TestMapStatus:
    def test_status_carto(self):
        r = requests.get(f"{BASE_URL}/api/map/status", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d == {"source": "carto", "keyConfigured": True, "keyValid": True}


class TestTiles:
    def test_known_tile_real_carto(self):
        r = requests.get(f"{BASE_URL}/api/map/tiles/14/8003/5320.png", timeout=30)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/png")
        assert r.headers.get("x-tile-source") == "carto"
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n"
        assert len(r.content) != 2513
        assert len(r.content) > 5000

    def test_miss_then_hit(self):
        # pick a random uncached tile near Llanfairpwll at z16
        x, y = 32012 + random.randint(0, 40), 21280 + random.randint(0, 40)
        r1 = requests.get(f"{BASE_URL}/api/map/tiles/16/{x}/{y}.png", timeout=30)
        assert r1.status_code == 200
        r2 = requests.get(f"{BASE_URL}/api/map/tiles/16/{x}/{y}.png", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("x-tile-cache") == "HIT"
        assert r1.content == r2.content
        assert r1.headers.get("x-tile-cache") in ("MISS", "HIT")  # HIT only if random collision

    @pytest.mark.parametrize("path", ["3/99/1", "3/1/99", "21/0/0", "-1/0/0"])
    def test_out_of_range_404(self, path):
        r = requests.get(f"{BASE_URL}/api/map/tiles/{path}.png", timeout=30)
        assert r.status_code == 404

    def test_non_int_422(self):
        r = requests.get(f"{BASE_URL}/api/map/tiles/a/b/c.png", timeout=30)
        assert r.status_code == 422

    def test_local_cache_control(self):
        r = requests.get(f"{LOCAL}/api/map/tiles/14/8003/5320.png", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("cache-control") == "public, max-age=86400, immutable"


class TestKeyLeak:
    def test_key_not_in_responses(self):
        assert KEY, "CARTO_API_KEY not in test env"
        for path in ["/api/map/status", "/openapi.json", "/api/map/tiles/14/8003/5320.png", "/api/map/tiles/3/99/1.png", "/api/health"]:
            r = requests.get(f"{BASE_URL}{path}", timeout=30)
            assert KEY not in r.text if "png" not in path or r.status_code != 200 else True
            assert KEY not in str(dict(r.headers))
            assert KEY.encode() not in r.content

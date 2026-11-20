# Spectre Intel (You.com live search) API tests - Phase 2
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
SLUGS = {"doomspike-emf", "necro-sweep-spiritbox", "abyssal-thermal-sls", "iron-maiden-rempod",
         "pentagrid-laser-matrix", "black-tape-parabolic-evp"}
URL = f"{BASE_URL}/api/intel/search"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _check_shape(data):
    assert isinstance(data["results"], list) and len(data["results"]) <= 6
    for r in data["results"]:
        for k in ("title", "url", "snippet", "source"):
            assert isinstance(r[k], str)
        assert r["url"].startswith("http")
    assert set(data["recommended"]) <= SLUGS


# Live search + cache
class TestIntelLive:
    def test_beaumaris_then_cached(self, api):
        q = "Beaumaris Gaol"
        r1 = api.post(URL, json={"query": q}, timeout=30)
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        _check_shape(d1)
        assert d1["query"] == q
        assert len(d1["results"]) >= 1
        assert 1 <= len(d1["recommended"]) <= 3
        r2 = api.post(URL, json={"query": q}, timeout=30)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["cached"] is True
        assert d2["results"] == d1["results"]
        key = os.environ.get("YDC_API_KEY", "")
        if key:
            assert key not in r1.text and key not in r2.text

    def test_nonsense_query_graceful(self, api):
        q = f"zxqv{uuid.uuid4().hex[:10]}qqj"
        r = api.post(URL, json={"query": q}, timeout=30)
        assert r.status_code in (200, 502), r.text
        if r.status_code == 200:
            d = r.json()
            _check_shape(d)
            if not d["results"]:
                assert d["recommended"] == []
        else:
            assert r.json()["detail"] == "The spirits are silent. Try again shortly."


# Validation
class TestIntelValidation:
    @pytest.mark.parametrize("q", ["a", "", "   ", " a "])
    def test_short_query_422(self, api, q):
        r = api.post(URL, json={"query": q}, timeout=15)
        assert r.status_code == 422

    def test_missing_body_422(self, api):
        assert api.post(URL, json={}, timeout=15).status_code == 422

    def test_too_long_422(self, api):
        assert api.post(URL, json={"query": "x" * 121}, timeout=15).status_code == 422

    def test_openapi_lists_intel(self, api):
        r = api.get(f"{BASE_URL}/api/openapi.json", timeout=15)
        assert r.status_code == 200
        assert "/api/intel/search" in r.json()["paths"]

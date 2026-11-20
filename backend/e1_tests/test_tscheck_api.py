from conftest import suffix, future
def test_openapi_and_equipment(client):
    assert client.get("/openapi.json").status_code == 200
    r = client.get("/equipment"); assert r.status_code == 200
    assert len(r.json()["items"]) == 6

def test_booking_create_list_cancel(client):
    s = suffix(); email = f"tscheck-api-{s}@example.com"
    slug = client.get("/equipment").json()["items"][0]["slug"]
    r = client.post("/bookings", json={"hunterName": f"tscheck-api-{s}", "email": email,
        "pickupDate": future(5), "returnDate": future(8), "nights": 3, "items": [{"slug": slug}]})
    assert r.status_code in (200, 201), r.text
    body = r.json(); b = body.get("booking", body); code = b["bookingCode"]
    lst = client.get("/bookings", params={"email": email}).json()
    assert code in str(lst)
    d = client.delete(f"/bookings/{code}"); assert d.status_code in (200, 204), d.text
    assert code not in str(client.get("/bookings", params={"email": email}).json()) or "cancel" in str(client.get("/bookings", params={"email": email}).json()).lower()

def test_booking_past_date_rejected(client):
    slug = client.get("/equipment").json()["items"][0]["slug"]
    r = client.post("/bookings", json={"hunterName": "tscheck-past", "email": "tscheck-past@example.com",
        "pickupDate": future(-3), "returnDate": future(-1), "nights": 2, "items": [{"slug": slug}]})
    assert 400 <= r.status_code < 500

def test_sightings_create_and_invalid(client):
    s = suffix()
    r = client.post("/sightings", json={"hunterName": f"tscheck-log-{s}", "location": "Somewhere", "gearUsed": "EMF", "peakEmf": 12.3, "report": "tscheck cold spot report text"})
    assert r.status_code in (200, 201), r.text
    assert f"tscheck-log-{s}" in str(client.get("/sightings").json()["sightings"][0])
    assert 400 <= client.post("/sightings", json={"hunterName": "x"}).status_code < 500

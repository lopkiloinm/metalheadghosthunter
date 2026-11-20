import uuid, datetime, httpx, pytest
BASE = "http://localhost:8001/api"
@pytest.fixture
def client():
    with httpx.Client(base_url=BASE, timeout=20) as c:
        yield c
def suffix(): return uuid.uuid4().hex[:8]
def future(days): return (datetime.date.today() + datetime.timedelta(days=days)).isoformat()

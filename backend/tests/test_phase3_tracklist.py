# Phase 3: tracklist fields on /api/equipment (trackNumber, trackName, runtime) + static assets
import os
import re
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')


def _items():
    r = requests.get(f"{BASE_URL}/api/equipment", timeout=20)
    assert r.status_code == 200
    data = r.json()
    return data if isinstance(data, list) else data.get('items') or data.get('equipment')


def test_equipment_has_track_fields():
    items = _items()
    assert len(items) == 6
    nums = sorted(i['trackNumber'] for i in items)
    assert nums == [1, 2, 3, 4, 5, 6]
    for i in items:
        assert isinstance(i['trackName'], str) and i['trackName']
        assert re.fullmatch(r"\d{1,2}:\d{2}", i['runtime'])


def test_spiritbox_track_name():
    items = {i['slug']: i for i in _items()}
    assert items['necro-sweep-spiritbox']['trackName'] == 'Static Communion'


def test_total_runtime_52_47():
    total = sum(int(m) * 60 + int(s) for m, s in (i['runtime'].split(':') for i in _items()))
    assert f"{total // 60}:{total % 60:02d}" == '52:47'


def test_assets_served():
    for name in ['cover-armoury.webp', 'cover-loadouts.webp', 'cover-raid.webp', 'cover-map.webp',
                 'cover-intel.webp', 'cover-fieldlogs.webp', 'fog-face.webp', 'cursor-horns.svg']:
        r = requests.get(f"{BASE_URL}/assets/{name}", timeout=20)
        assert r.status_code == 200, name
        assert len(r.content) > 200, name

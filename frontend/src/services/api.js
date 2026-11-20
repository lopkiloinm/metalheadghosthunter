import {
  FALLBACK_ADDONS,
  FALLBACK_BUNDLES,
  FALLBACK_EQUIPMENT,
  FALLBACK_HOTSPOTS,
  FALLBACK_SIGHTINGS,
} from '../data/equipmentCatalog';

// Emergent.sh provides REACT_APP_BACKEND_URL in frontend/.env.
// Locally, if left empty, Vite proxies `/api` directly to http://127.0.0.1:8001.
const BACKEND_BASE = (
  import.meta.env.REACT_APP_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).replace(/\/$/, '');

const API = `${BACKEND_BASE}/api`;
const LOCAL_BOOKINGS_KEY = 'llanfair_spectre_bookings_v1';
const LOCAL_SIGHTINGS_KEY = 'llanfair_spectre_sightings_v1';

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.detail || `API error ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchInitialForgeData() {
  try {
    const [health, eq, bundles, hotspots, sightings] = await Promise.all([
      apiRequest('/health'),
      apiRequest('/equipment'),
      apiRequest('/bundles'),
      apiRequest('/hotspots'),
      apiRequest('/sightings'),
    ]);
    return {
      online: true,
      storageMode: health.storage || 'mongodb',
      equipment: eq.items || FALLBACK_EQUIPMENT,
      addons: eq.addons || FALLBACK_ADDONS,
      bundles: bundles.bundles || FALLBACK_BUNDLES,
      hotspots: hotspots.hotspots || FALLBACK_HOTSPOTS,
      sightings: sightings.sightings || FALLBACK_SIGHTINGS,
    };
  } catch {
    const savedSightings = JSON.parse(localStorage.getItem(LOCAL_SIGHTINGS_KEY) || '[]');
    return {
      online: false,
      storageMode: 'browser-offline',
      equipment: FALLBACK_EQUIPMENT,
      addons: FALLBACK_ADDONS,
      bundles: FALLBACK_BUNDLES,
      hotspots: FALLBACK_HOTSPOTS,
      sightings: [...savedSightings, ...FALLBACK_SIGHTINGS],
    };
  }
}

export async function createRentalBooking(payload) {
  try {
    const data = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { booking: data.booking, persistedOnline: true };
  } catch {
    // Offline fallback calculation so the booking flow remains usable even without a running server
    const eqMap = Object.fromEntries(FALLBACK_EQUIPMENT.map((e) => [e.slug, e]));
    let subtotal = 0;
    let deposit = 0;
    const resolvedItems = payload.items.map((entry) => {
      const eq = eqMap[entry.slug];
      const lineTotal = (eq?.dailyRate || 20) * entry.quantity * payload.nights;
      subtotal += lineTotal;
      deposit += (eq?.deposit || 50) * entry.quantity;
      return {
        slug: entry.slug,
        name: eq?.name || entry.slug,
        quantity: entry.quantity,
        dailyRate: eq?.dailyRate || 20,
        lineTotal,
      };
    });
    const discount = payload.nights >= 3 ? Number((subtotal * 0.15).toFixed(2)) : 0;
    const addons = (payload.addonIds || [])
      .map((id) => (FALLBACK_ADDONS[id] ? { id, ...FALLBACK_ADDONS[id] } : null))
      .filter(Boolean);
    const addonsTotal = addons.reduce((acc, a) => acc + a.price, 0);
    const code = `PWLL-666-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const booking = {
      id: `local-${Date.now()}`,
      bookingCode: code,
      status: 'CONFIRMED',
      ...payload,
      items: resolvedItems,
      addons,
      subtotal,
      riffLordDiscount: discount,
      addonsTotal,
      totalGbp: Number((subtotal - discount + addonsTotal).toFixed(2)),
      refundableDepositGbp: deposit,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || '[]');
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify([booking, ...existing]));
    return { booking, persistedOnline: false };
  }
}

export async function fetchBookings({ code = '', email = '' } = {}) {
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (email) params.set('email', email);
  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    const data = await apiRequest(`/bookings${query}`);
    return data.bookings || [];
  } catch {
    const saved = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || '[]');
    return saved.filter((b) => {
      if (code && b.bookingCode.toUpperCase() !== code.trim().toUpperCase()) return false;
      if (email && b.email.toLowerCase() !== email.trim().toLowerCase()) return false;
      return true;
    });
  }
}

export async function cancelRentalBooking(bookingCode) {
  try {
    await apiRequest(`/bookings/${encodeURIComponent(bookingCode)}`, { method: 'DELETE' });
    return true;
  } catch {
    const saved = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || '[]');
    localStorage.setItem(
      LOCAL_BOOKINGS_KEY,
      JSON.stringify(saved.filter((b) => b.bookingCode !== bookingCode))
    );
    return true;
  }
}

export async function submitFieldSighting(payload) {
  try {
    const data = await apiRequest('/sightings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.sighting;
  } catch {
    const sighting = {
      id: `log-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem(LOCAL_SIGHTINGS_KEY) || '[]');
    localStorage.setItem(LOCAL_SIGHTINGS_KEY, JSON.stringify([sighting, ...saved]));
    return sighting;
  }
}

import {
  FALLBACK_ADDONS,
  FALLBACK_BUNDLES,
  FALLBACK_EQUIPMENT,
  FALLBACK_HOTSPOTS,
  FALLBACK_SIGHTINGS,
} from '../data/equipmentCatalog';
import { computeTotals } from '../lib/pricing';

// Empty REACT_APP_BACKEND_URL means same-origin `/api` (Vite dev proxy).
const API = `${(import.meta.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '')}/api`;
const LOCAL_BOOKINGS_KEY = 'llanfair_spectre_bookings_v1';
const LOCAL_SIGHTINGS_KEY = 'llanfair_spectre_sightings_v1';
const MY_CODES_KEY = 'llanfair_spectre_my_codes_v1';

const readLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const writeLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Only network failures and gateway errors mean "backend unreachable"; other HTTP errors are real answers.
const isOffline = (err) => !(err instanceof ApiError) || [502, 503, 504].includes(err.status);

function errorDetail(body, status) {
  if (Array.isArray(body.detail)) return body.detail[0]?.msg?.replace(/^Value error, /, '') || 'Invalid request';
  return body.detail || `API error ${status}`;
}

async function apiRequest(path, options = {}) {
  const { timeoutMs = 6000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(errorDetail(body, res.status), res.status);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const getMyBookingCodes = () => readLocal(MY_CODES_KEY);
const rememberBookingCode = (code) => writeLocal(MY_CODES_KEY, [code, ...getMyBookingCodes().filter((c) => c !== code)]);
const forgetBookingCode = (code) => writeLocal(MY_CODES_KEY, getMyBookingCodes().filter((c) => c !== code));

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
      storageMode: health.storage,
      equipment: eq.items,
      addons: eq.addons,
      bundles: bundles.bundles,
      hotspots: hotspots.hotspots,
      sightings: sightings.sightings,
    };
  } catch {
    return {
      online: false,
      storageMode: 'browser-offline',
      equipment: FALLBACK_EQUIPMENT,
      addons: FALLBACK_ADDONS,
      bundles: FALLBACK_BUNDLES,
      hotspots: FALLBACK_HOTSPOTS,
      sightings: [...readLocal(LOCAL_SIGHTINGS_KEY), ...FALLBACK_SIGHTINGS],
    };
  }
}

function buildOfflineBooking(payload) {
  const eqMap = Object.fromEntries(FALLBACK_EQUIPMENT.map((e) => [e.slug, e]));
  const lines = payload.items.map((entry) => ({ ...eqMap[entry.slug], quantity: entry.quantity }));
  const totals = computeTotals(lines, payload.nights, payload.addonIds, FALLBACK_ADDONS);
  return {
    id: `local-${Date.now()}`,
    bookingCode: `PWLL-666-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    status: 'CONFIRMED',
    ...payload,
    items: lines.map((l) => ({
      slug: l.slug,
      name: l.name,
      quantity: l.quantity,
      dailyRate: l.dailyRate,
      lineTotal: l.dailyRate * l.quantity * payload.nights,
    })),
    addons: payload.addonIds.filter((id) => FALLBACK_ADDONS[id]).map((id) => ({ id, ...FALLBACK_ADDONS[id] })),
    subtotal: totals.subtotal,
    riffLordDiscount: totals.discount,
    addonsTotal: totals.addonsTotal,
    totalGbp: totals.total,
    refundableDepositGbp: totals.deposit,
    createdAt: new Date().toISOString(),
  };
}

export async function createRentalBooking(payload) {
  let booking;
  try {
    booking = (await apiRequest('/bookings', { method: 'POST', body: JSON.stringify(payload) })).booking;
  } catch (err) {
    if (!isOffline(err)) throw err;
    booking = buildOfflineBooking(payload);
    writeLocal(LOCAL_BOOKINGS_KEY, [booking, ...readLocal(LOCAL_BOOKINGS_KEY)]);
  }
  rememberBookingCode(booking.bookingCode);
  return booking;
}

export async function fetchBookings({ codes = [], code = '', email = '' } = {}) {
  const params = new URLSearchParams();
  if (codes.length) params.set('codes', codes.join(','));
  if (code) params.set('code', code.trim());
  if (email) params.set('email', email.trim());
  try {
    return (await apiRequest(`/bookings?${params.toString()}`)).bookings;
  } catch {
    const wanted = [...codes, code].filter(Boolean).map((c) => c.trim().toUpperCase());
    return readLocal(LOCAL_BOOKINGS_KEY).filter(
      (b) =>
        (!wanted.length || wanted.includes(b.bookingCode)) &&
        (!email || b.email.toLowerCase() === email.trim().toLowerCase())
    );
  }
}

export async function cancelRentalBooking(bookingCode) {
  try {
    await apiRequest(`/bookings/${encodeURIComponent(bookingCode)}`, { method: 'DELETE' });
  } catch (err) {
    if (isOffline(err)) {
      writeLocal(LOCAL_BOOKINGS_KEY, readLocal(LOCAL_BOOKINGS_KEY).filter((b) => b.bookingCode !== bookingCode));
    } else if (err.status !== 404) {
      throw err;
    }
  }
  forgetBookingCode(bookingCode);
}

export async function submitFieldSighting(payload) {
  try {
    return (await apiRequest('/sightings', { method: 'POST', body: JSON.stringify(payload) })).sighting;
  } catch (err) {
    if (!isOffline(err)) throw err;
    const spot = FALLBACK_HOTSPOTS.find((h) => h.id === payload.hotspotId);
    const pin = payload.lat != null ? {} : spot ? { lat: spot.lat + (Math.random() - 0.5) * 0.0008, lng: spot.lng + (Math.random() - 0.5) * 0.0012 } : {};
    const sighting = { id: `log-${Date.now()}`, ...payload, ...pin, createdAt: new Date().toISOString() };
    writeLocal(LOCAL_SIGHTINGS_KEY, [sighting, ...readLocal(LOCAL_SIGHTINGS_KEY)]);
    return sighting;
  }
}

export const TILE_PROXY_URL = `${API}/map/tiles/{z}/{x}/{y}.png`;

export async function fetchMapStatus() {
  try {
    return await apiRequest('/map/status', { timeoutMs: 12000 });
  } catch {
    return null;
  }
}

export async function fetchRoutes() {
  try {
    return await apiRequest('/routes');
  } catch {
    return (await import('../data/mapRoutes.json')).default;
  }
}

// Live You.com lore via the backend; no offline fallback (the key lives server-side only).
export async function searchIntel(query) {
  return apiRequest('/intel/search', { method: 'POST', body: JSON.stringify({ query }), timeoutMs: 16000 });
}

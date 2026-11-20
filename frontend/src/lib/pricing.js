export const DISCOUNT_RATE = 0.15;
export const DISCOUNT_MIN_NIGHTS = 3;
export const MAX_NIGHTS = 14;

const round2 = (n) => Number(n.toFixed(2));
const pad = (n) => String(n).padStart(2, '0');

export function isoDay(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nightsBetween(start, end) {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

export function validateRentalDates(start, end, today = isoDay(0)) {
  if (!start) return { nights: 0, error: 'Choose a pickup date to continue.' };
  if (!end) return { nights: 0, error: 'Choose a return date to continue.' };
  if (start < today) return { nights: 0, error: 'Pickup date cannot be in the past.' };
  const nights = nightsBetween(start, end);
  if (nights < 1) return { nights: 0, error: 'Return date must be after the pickup date.' };
  if (nights > MAX_NIGHTS) return { nights, error: `Rentals max out at ${MAX_NIGHTS} nights.` };
  return { nights, error: '' };
}

// lines: [{ dailyRate, deposit, quantity }]
export function computeTotals(lines, nights, addonIds = [], addons = {}) {
  const subtotal = lines.reduce((sum, l) => sum + l.dailyRate * l.quantity * nights, 0);
  const discount = nights >= DISCOUNT_MIN_NIGHTS ? round2(subtotal * DISCOUNT_RATE) : 0;
  const addonsTotal = addonIds.reduce((sum, id) => sum + (addons[id]?.price || 0), 0);
  const deposit = lines.reduce((sum, l) => sum + l.deposit * l.quantity, 0);
  return { subtotal, discount, addonsTotal, deposit, total: round2(subtotal - discount + addonsTotal) };
}

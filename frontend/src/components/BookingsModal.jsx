import React, { useEffect, useState } from 'react';
import { ScrollText, Search, Trash2, X } from 'lucide-react';
import { cancelRentalBooking, fetchBookings } from '../services/api';

export function BookingsModal({ open, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(filterValue = '') {
    setLoading(true);
    try {
      const trimmed = filterValue.trim();
      const params = trimmed.includes('@')
        ? { email: trimmed }
        : trimmed
          ? { code: trimmed }
          : {};
      const list = await fetchBookings(params);
      setBookings(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load('');
  }, [open]);

  if (!open) return null;

  async function handleCancel(code) {
    await cancelRentalBooking(code);
    setBookings((prev) => prev.filter((b) => b.bookingCode !== code));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#0a0b10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ScrollText className="h-5 w-5 text-brass" />
            <h2 className="font-display text-lg font-bold tracking-wider text-bone">
              FORGED RENTAL MANIFESTS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 p-2 text-bone/70 hover:border-crimson hover:text-white"
            aria-label="Close manifests"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(query);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code (PWLL-666-XXXX) or email..."
              className="flex-1 rounded-lg border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-bone focus:border-brass focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brass/20 px-4 py-2 font-mono text-xs font-bold uppercase text-brass transition hover:bg-brass hover:text-black"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Lookup</span>
            </button>
          </form>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {loading ? (
            <p className="py-10 text-center font-mono text-xs text-bone/60">
              Querying Llanfair Spectre Forge ledger...
            </p>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-base text-bone/75">No manifests found yet.</p>
              <p className="mt-1 font-mono text-xs text-bone/45">
                Reserve gear in your Iron Rental Crate to generate a manifest code.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.bookingCode}
                className="rounded-xl border border-white/10 bg-iron/90 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-gothic text-lg text-crimson">{b.bookingCode}</span>
                    <span className="ml-2 rounded bg-ecto/15 px-2 py-0.5 font-mono text-[10px] text-ecto">
                      {b.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancel(b.bookingCode)}
                    className="inline-flex items-center gap-1 rounded border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase text-bone/60 hover:border-crimson hover:text-crimson"
                  >
                    <Trash2 className="h-3 w-3" />
                    Cancel
                  </button>
                </div>

                <div className="mt-2 grid gap-1 font-mono text-xs text-bone/75 sm:grid-cols-2">
                  <div>Hunter: {b.hunterName}</div>
                  <div>Pickup: {b.pickupDate} ({b.nights}n)</div>
                  <div className="sm:col-span-2 text-brass">{b.pickupLocation}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(b.items || []).map((it) => (
                    <span
                      key={it.slug}
                      className="rounded border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[10px] text-bone/80"
                    >
                      {it.quantity}× {it.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t border-white/10 pt-2 font-mono text-xs">
                  <span className="text-bone/50">Total</span>
                  <span className="font-bold text-ecto">£{Number(b.totalGbp).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

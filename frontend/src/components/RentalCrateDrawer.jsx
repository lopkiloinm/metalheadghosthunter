import React, { useMemo, useState } from 'react';
import { CheckCircle2, Flame, Minus, Package, Plus, Trash2, X } from 'lucide-react';
import { createRentalBooking } from '../services/api';

const PICKUP_OPTIONS = [
  'Forge Bunker (Behind Llanfairpwll 58-Letter Station)',
  'Menai Suspension Bridge Layby Midnight Drop (+£0)',
  'St. Tysilio Causeway Coven Van Handover',
  'Bryn Celli Ddu Car Park Twilight Drop',
];

export function RentalCrateDrawer({
  open,
  onClose,
  crateItems,
  addons,
  hotspots,
  defaultHotspot = '',
  onUpdateQty,
  onRemoveItem,
  onClearCrate,
  onBookingConfirmed,
}) {
  const tomorrow = useMemo(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  }, []);

  const [nights, setNights] = useState(2);
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupLocation, setPickupLocation] = useState(PICKUP_OPTIONS[0]);
  const [targetHotspot, setTargetHotspot] = useState(defaultHotspot || hotspots[0]?.name || '');
  const [selectedAddons, setSelectedAddons] = useState(['black-cells']);
  const [hunterName, setHunterName] = useState('');
  const [email, setEmail] = useState('');
  const [bandOrCoven, setBandOrCoven] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  if (!open) return null;

  const subtotal = crateItems.reduce(
    (sum, entry) => sum + entry.item.dailyRate * entry.quantity * nights,
    0
  );
  const riffLordDiscount = nights >= 3 ? Number((subtotal * 0.15).toFixed(2)) : 0;
  const addonsTotal = selectedAddons.reduce((sum, id) => sum + (addons[id]?.price || 0), 0);
  const grandTotal = Number((subtotal - riffLordDiscount + addonsTotal).toFixed(2));
  const depositTotal = crateItems.reduce(
    (sum, entry) => sum + entry.item.deposit * entry.quantity,
    0
  );

  function toggleAddon(id) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setError('');
    if (crateItems.length === 0) {
      setError('Your rental crate is empty. Add at least one instrument first.');
      return;
    }
    if (hunterName.trim().length < 2 || !email.includes('@')) {
      setError('Please enter your name/alias and a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const { booking } = await createRentalBooking({
        hunterName,
        email,
        bandOrCoven,
        pickupDate,
        nights,
        pickupLocation,
        targetHotspot,
        items: crateItems.map((c) => ({ slug: c.item.slug, quantity: c.quantity })),
        addonIds: selectedAddons,
        notes,
      });
      setConfirmed(booking);
      onClearCrate();
      onBookingConfirmed?.(booking);
    } catch (err) {
      setError(err.message || 'Could not forge booking manifest.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-white/15 bg-[#0a0b10] shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-crimson" />
            <div>
              <h2 className="font-display text-lg font-bold tracking-wider text-bone">
                IRON RENTAL CRATE
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
                Llanfairpwllgwyngyll Dispatch &amp; Manifest
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              onClose();
            }}
            className="rounded-lg border border-white/15 p-2 text-bone/70 transition hover:border-crimson hover:text-white"
            aria-label="Close rental crate"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {confirmed ? (
            <div className="rounded-xl border border-ecto/50 bg-ecto/10 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-ecto" />
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-ecto">
                // RITUAL MANIFEST FORGED
              </p>
              <h3 className="mt-1 font-gothic text-2xl text-bone">{confirmed.bookingCode}</h3>
              <p className="mt-2 text-sm text-bone/80">
                Your gear crate is reserved for <strong className="text-bone">{confirmed.hunterName}</strong>{' '}
                starting <strong className="text-brass">{confirmed.pickupDate}</strong> ({confirmed.nights}{' '}
                {confirmed.nights === 1 ? 'night' : 'nights'}).
              </p>
              <div className="mt-5 rounded-lg border border-white/10 bg-black/50 p-4 text-left font-mono text-xs">
                <div className="flex justify-between text-bone/70">
                  <span>Pickup Bunker:</span>
                  <span className="text-right text-bone">{confirmed.pickupLocation}</span>
                </div>
                <div className="mt-2 flex justify-between text-bone/70">
                  <span>Rental Total:</span>
                  <span className="font-bold text-ecto">£{confirmed.totalGbp.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between text-bone/55">
                  <span>Refundable Deposit (at pickup):</span>
                  <span>£{confirmed.refundableDepositGbp}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmed(null);
                  onClose();
                }}
                className="mt-6 w-full rounded-lg bg-crimson py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-[#ff4260]"
              >
                Return to 3D Armoury
              </button>
            </div>
          ) : crateItems.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-bone/25" />
              <p className="mt-4 font-display text-lg text-bone/80">Your Iron Crate is Empty</p>
              <p className="mt-1 text-sm text-bone/55">
                Pick instruments from the 3D Armoury or load a pre-forged Coven Loadout.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Gear Line Items */}
              <div className="space-y-3">
                {crateItems.map(({ item, quantity }) => (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-iron/90 p-3.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-bold text-bone">
                        {item.name}
                      </div>
                      <div className="font-mono text-xs text-brass">
                        £{item.dailyRate}/night • £{item.dailyRate * quantity * nights} total
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.slug, quantity - 1)}
                        className="rounded border border-white/15 bg-black/50 p-1.5 text-bone hover:border-crimson"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.slug, quantity + 1)}
                        className="rounded border border-white/15 bg-black/50 p-1.5 text-bone hover:border-crimson"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.slug)}
                        className="ml-1 rounded p-1.5 text-bone/45 hover:text-crimson"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rental Dates & Nights */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">Pickup Date</span>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-bone focus:border-crimson focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">
                    Nights {nights >= 3 ? '(15% OFF!)' : '(3+ = 15% OFF)'}
                  </span>
                  <select
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#0c0d12] px-3 py-2 font-mono text-xs text-bone focus:border-crimson focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 7, 14].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Night' : 'Nights'} {n >= 3 ? '— Riff Lord -15%' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Llanfairpwllgwyngyll Pickup Point & Target Site */}
              <div className="space-y-3">
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">
                    Llanfairpwllgwyngyll Pickup / Drop Point
                  </span>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#0c0d12] px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  >
                    {PICKUP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">
                    Target Haunting Site (For Free Field Map)
                  </span>
                  <select
                    value={targetHotspot}
                    onChange={(e) => setTargetHotspot(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#0c0d12] px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  >
                    {hotspots.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Ritual Add-ons */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-bone/60">
                  Optional Ritual Add-Ons
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(addons).map(([id, addon]) => {
                    const active = selectedAddons.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleAddon(id)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                          active
                            ? 'border-ecto/60 bg-ecto/10 text-bone'
                            : 'border-white/10 bg-black/40 text-bone/65 hover:border-white/25'
                        }`}
                      >
                        <span className="pr-2">{addon.name}</span>
                        <span className="shrink-0 font-mono text-brass">+£{addon.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hunter Contact Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">Hunter Name *</span>
                  <input
                    type="text"
                    required
                    value={hunterName}
                    onChange={(e) => setHunterName(e.target.value)}
                    placeholder="Rhys Blackwood"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase text-bone/60">Email *</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rhys@doomcoven.wales"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-mono text-[11px] uppercase text-bone/60">
                    Band / Coven Name (Optional)
                  </span>
                  <input
                    type="text"
                    value={bandOrCoven}
                    onChange={(e) => setBandOrCoven(e.target.value)}
                    placeholder="e.g. Sons of Anglesey"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-mono text-[11px] uppercase text-bone/60">
                    Special Notes (Amp cabling, late arrival, etc.)
                  </span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Need 6.35mm jack for fuzz pedal..."
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-bone focus:border-crimson focus:outline-none"
                  />
                </label>
              </div>

              {/* Price Summary */}
              <div className="rounded-xl border border-white/10 bg-black/55 p-4 font-mono text-xs">
                <div className="flex justify-between text-bone/70">
                  <span>Gear ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                {riffLordDiscount > 0 && (
                  <div className="mt-1.5 flex justify-between text-ecto">
                    <span>Riff Lord Multi-Night Discount (-15%)</span>
                    <span>-£{riffLordDiscount.toFixed(2)}</span>
                  </div>
                )}
                {addonsTotal > 0 && (
                  <div className="mt-1.5 flex justify-between text-bone/70">
                    <span>Ritual Add-Ons</span>
                    <span>£{addonsTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold text-bone">
                  <span>TOTAL DUE</span>
                  <span className="text-crimson">£{grandTotal.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-bone/45">
                  <span>Refundable Gear Deposit (card hold at bunker)</span>
                  <span>£{depositTotal}</span>
                </div>
              </div>

              {error && (
                <p className="rounded border border-crimson/50 bg-crimson/10 px-3 py-2 font-mono text-xs text-crimson">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-crimson transition hover:bg-[#ff4260] disabled:opacity-50"
              >
                <Flame className="h-4 w-4" />
                <span>{submitting ? 'Forging Manifest...' : `Confirm Rental • £${grandTotal.toFixed(2)}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

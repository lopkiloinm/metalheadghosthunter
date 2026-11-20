import React from 'react';
import { CheckCircle2, ScrollText } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatGbp } from '../../lib/format';

export function BookingSuccess({ booking, onClose, onViewBookings }) {
  const rows = [
    ['Hunter', booking.hunterName],
    ['Pickup', `${booking.pickupDate} · ${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`],
    ['Drop point', booking.pickupLocation],
    ['Total', formatGbp(booking.totalGbp)],
    ['Deposit (at pickup)', formatGbp(booking.refundableDepositGbp)],
  ];

  return (
    <div data-testid="booking-success" className="flex-1 overflow-y-auto px-6 py-10">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-spectral" strokeWidth={1.4} />
        <p className="overline mt-5 text-spectral">Ritual manifest forged</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ash">Booking reference</p>
        <p data-testid="booking-reference" className="mt-1 select-all font-display text-5xl font-black tracking-tight text-bone">
          {booking.bookingCode}
        </p>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ash">Quote this code at the bunker. It is saved under My Bookings on this device.</p>
      </div>

      <dl className="mt-8 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-void/60 px-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3 text-sm">
            <dt className="text-ash">{k}</dt>
            <dd className="text-right font-bold text-bone">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" data-testid="booking-success-view-bookings" onClick={onViewBookings}>
          <ScrollText className="h-4 w-4" /> My Bookings
        </Button>
        <Button data-testid="booking-success-close" onClick={onClose}>
          Back to the Forge
        </Button>
      </div>
    </div>
  );
}

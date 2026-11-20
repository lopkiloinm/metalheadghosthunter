import React, { useMemo } from 'react';
import { CalendarRange, MapPin, ScrollText } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatGbp } from '../../lib/format';

function Barcode({ code }) {
  const bars = useMemo(() => {
    const out = [];
    let x = 0;
    [...`*${code}*`].forEach((ch, i) => {
      const c = ch.charCodeAt(0) + i * 7;
      for (let b = 0; b < 5; b += 1) {
        const w = 1 + ((c >> b) & 1) + (b === 2 ? 1 : 0);
        out.push({ x, w });
        x += w + 1 + ((c >> (b + 1)) & 1);
      }
    });
    return { out, width: x };
  }, [code]);
  return (
    <svg data-testid="ticket-barcode" viewBox={`0 0 ${bars.width} 40`} preserveAspectRatio="none" className="h-12 w-full" aria-hidden="true">
      {bars.out.map((b) => (
        <rect key={b.x} x={b.x} y="0" width={b.w} height="40" fill="#f4ede4" />
      ))}
    </svg>
  );
}

export function BookingSuccess({ booking, onClose, onViewBookings }) {
  const nights = `${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`;
  return (
    <div data-testid="booking-success" className="flex-1 overflow-y-auto px-5 py-8 sm:px-6">
      <p className="overline text-center text-spectral">Ritual manifest forged</p>

      <article data-testid="ticket-pass" className="ticket mt-5 overflow-hidden rounded-2xl text-bone" aria-label={`Gig pass ${booking.bookingCode}`}>
        <div className="relative p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Spectre Forge presents</p>
          <p className="mt-2 font-blackletter text-4xl leading-none">{booking.bandOrCoven || booking.hunterName}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ash">Live at the Restless Dead · Ynys Môn</p>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ash"><CalendarRange className="h-3 w-3" /> Doors</dt>
              <dd data-testid="ticket-dates" className="mt-1 font-bold">
                {booking.pickupDate} → {booking.returnDate}
                <span className="block text-xs font-normal text-ash">{nights}</span>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ash"><MapPin className="h-3 w-3" /> Venue</dt>
              <dd className="mt-1 font-bold">{booking.pickupLocation}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ash">Setlist</p>
            <ol data-testid="ticket-setlist" className="mt-2 space-y-1.5">
              {booking.items.map((it, i) => (
                <li key={it.slug || it.name} className="flex items-baseline gap-3 text-sm">
                  <span className="w-5 shrink-0 font-blackletter text-lg leading-none text-ember">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate font-bold uppercase tracking-wide">{it.name}</span>
                  <span className="font-mono text-xs text-ash">×{it.quantity}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ash">Admit · {booking.hunterName}</p>
              <p className="mt-1 text-xs text-ash">Deposit at pickup {formatGbp(booking.refundableDepositGbp)}</p>
            </div>
            <p className="font-display text-3xl font-black leading-none">{formatGbp(booking.totalGbp)}</p>
          </div>
        </div>

        <div data-testid="ticket-stub" className="ticket-stub relative px-5 pb-5 pt-6 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ash">Booking reference</p>
              <p data-testid="booking-reference" className="mt-1 select-all font-display text-4xl font-black tracking-tight text-bone">
                {booking.bookingCode}
              </p>
            </div>
            <p className="pb-1 text-right font-mono text-[10px] uppercase leading-relaxed tracking-widest text-ash">Stub · keep<br />until sunrise</p>
          </div>
          <div className="mt-3">
            <Barcode code={booking.bookingCode} />
          </div>
        </div>
      </article>

      <p className="mx-auto mt-4 max-w-xs text-center text-sm text-ash">Quote this code at the bunker. It is saved under My Bookings on this device.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

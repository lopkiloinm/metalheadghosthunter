import React, { useEffect, useState } from 'react';
import { Package, X } from 'lucide-react';
import { Drawer } from '../ui/Overlay';
import { IconButton } from '../ui/Button';
import { BookingSuccess } from './BookingSuccess';
import { CrateEmptyState } from './CrateEmptyState';
import { CrateBookingForm } from './CrateBookingForm';

export function RentalCrateDrawer({ open, onClose, crate, addons, hotspots, targetHotspot, onBooked, onBrowse, onViewBookings }) {
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (!open) setConfirmed(null);
  }, [open]);

  function handleBooked(booking) {
    setConfirmed(booking);
    crate.clear();
    onBooked(booking);
  }

  const count = crate.count;

  return (
    <Drawer open={open} onClose={onClose} labelledBy="crate-title" testId="crate-drawer">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ember/40 bg-ember/10">
            <Package className="h-4 w-4 text-ember" />
          </span>
          <div>
            <h2 id="crate-title" className="font-display text-2xl font-black uppercase leading-none tracking-tight text-bone">
              Your Iron Crate
            </h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ash">
              {confirmed ? 'Booking forged' : `${count} ${count === 1 ? 'item' : 'items'}`}
            </p>
          </div>
        </div>
        <IconButton label="Close crate" data-testid="crate-close-button" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </header>

      {confirmed ? (
        <BookingSuccess booking={confirmed} onClose={onClose} onViewBookings={onViewBookings} />
      ) : crate.items.length === 0 ? (
        <CrateEmptyState onBrowse={onBrowse} />
      ) : (
        <CrateBookingForm crate={crate} addons={addons} hotspots={hotspots} targetHotspot={targetHotspot} onBooked={handleBooked} />
      )}
    </Drawer>
  );
}

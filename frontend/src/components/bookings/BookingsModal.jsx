import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ScrollText, Search, X } from 'lucide-react';
import { Modal } from '../ui/Overlay';
import { Button, IconButton } from '../ui/Button';
import { BookingCard } from './BookingCard';
import { FieldError } from '../ui/Field';
import { cancelRentalBooking, fetchBookings, getMyBookingCodes } from '../../services/api';

export function BookingsModal({ open, onClose, onCancelled, onOpenCrate }) {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (q = '') => {
    const trimmed = q.trim();
    const params = trimmed.includes('@') ? { email: trimmed } : trimmed ? { code: trimmed } : { codes: getMyBookingCodes() };
    setSearched(Boolean(trimmed));
    if (!trimmed && !params.codes.length) {
      setBookings([]);
      return;
    }
    setLoading(true);
    try {
      setBookings(await fetchBookings(params));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      load('');
    }
  }, [open, load]);

  async function handleCancel(code) {
    setError('');
    try {
      await cancelRentalBooking(code);
    } catch (err) {
      setError(err.message || `Could not cancel ${code}.`);
      return;
    }
    setBookings((prev) => prev.filter((b) => b.bookingCode !== code));
    onCancelled(code);
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="bookings-title" testId="bookings-modal" className="max-w-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center gap-3">
          <ScrollText className="h-5 w-5 text-brass" />
          <h2 id="bookings-title" className="font-display text-2xl font-black uppercase tracking-tight text-bone">
            My Bookings
          </h2>
        </div>
        <IconButton label="Close bookings" data-testid="bookings-close-button" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </header>

      <form
        className="flex gap-2 border-b border-white/[0.06] px-6 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          load(query);
        }}
      >
        <label htmlFor="bookings-search" className="sr-only">Look up by booking code or email</label>
        <input id="bookings-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="PWLL-666-XXXX or email" data-testid="bookings-search-input" className="input-forge font-mono" />
        <Button type="submit" variant="secondary" data-testid="bookings-search-submit">
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Look up</span>
        </Button>
      </form>

      <div data-testid="bookings-list" className="space-y-4 p-6">
        {error && <FieldError testId="bookings-error">{error}</FieldError>}
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-10 font-mono text-xs text-ash">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the ledger…
          </p>
        ) : bookings.length === 0 ? (
          <div data-testid="bookings-empty-state" className="py-12 text-center">
            <p className="font-blackletter text-3xl text-bone">{searched ? 'No manifest found' : 'No bookings yet'}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ash">
              {searched ? 'Check the code or email and try again.' : 'Bookings you make on this device appear here. Look up others by code or email.'}
            </p>
            {!searched && (
              <Button className="mt-6" data-testid="bookings-empty-cta" onClick={onOpenCrate}>
                Open your crate
              </Button>
            )}
          </div>
        ) : (
          bookings.map((b) => <BookingCard key={b.bookingCode} booking={b} onCancel={handleCancel} />)
        )}
      </div>
    </Modal>
  );
}

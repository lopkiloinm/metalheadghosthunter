import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { FieldError } from '../ui/Field';
import { CrateLineItems } from './CrateLineItems';
import { CrateAddonPicker, CrateContactFields, CrateDateFields, CrateLogisticsFields, PICKUP_OPTIONS } from './CrateFields';
import { CrateSummary } from './CrateSummary';
import { createRentalBooking } from '../../services/api';
import { computeTotals, isoDay, validateRentalDates } from '../../lib/pricing';
import { formatGbp } from '../../lib/format';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateContact(form) {
  const errors = {};
  if (form.hunterName.trim().length < 2) errors.hunterName = 'Enter your name or alias (2+ characters).';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  return errors;
}

export function CrateBookingForm({ crate, addons, hotspots, targetHotspot, onBooked }) {
  const [form, setForm] = useState(() => ({
    pickupDate: isoDay(1),
    returnDate: isoDay(3),
    pickupLocation: PICKUP_OPTIONS[0],
    targetHotspot: targetHotspot || hotspots[0]?.name || '',
    hunterName: '',
    email: '',
    bandOrCoven: '',
    notes: '',
  }));
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetHotspot) setForm((f) => ({ ...f, targetHotspot }));
  }, [targetHotspot]);

  const { nights, error: dateError } = validateRentalDates(form.pickupDate, form.returnDate);
  const lines = useMemo(() => crate.items.map((c) => ({ ...c.item, quantity: c.quantity })), [crate.items]);
  const totals = computeTotals(lines, dateError ? 0 : nights, selectedAddons, addons);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleAddon = (id) => setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function handleSubmit(e) {
    e.preventDefault();
    if (dateError) return;
    const contactErrors = validateContact(form);
    setErrors(contactErrors);
    const firstInvalid = Object.keys(contactErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid === 'email' ? 'crate-email' : 'crate-name')?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const booking = await createRentalBooking({
        ...form,
        hunterName: form.hunterName.trim(),
        email: form.email.trim(),
        nights,
        items: crate.items.map((c) => ({ slug: c.item.slug, quantity: c.quantity })),
        addonIds: selectedAddons,
      });
      onBooked(booking);
    } catch (err) {
      setSubmitError(err.message || 'Could not forge the booking. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="crate-form" data-testid="crate-form" onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
        <CrateLineItems items={crate.items} nights={dateError ? 0 : nights} onSetQty={crate.setQty} onRemove={crate.remove} />
        <CrateDateFields form={form} update={update} nights={nights} dateError={dateError} />
        <CrateLogisticsFields form={form} update={update} hotspots={hotspots} />
        <CrateAddonPicker addons={addons} selected={selectedAddons} onToggle={toggleAddon} />
        <CrateContactFields form={form} update={update} errors={errors} />
      </div>

      <div className="space-y-4 border-t border-white/[0.06] bg-iron/80 px-6 py-5">
        <CrateSummary totals={totals} nights={dateError ? 0 : nights} />
        {dateError && <FieldError testId="crate-book-blocked-reason">Fix the rental dates to book: {dateError}</FieldError>}
        {(errors.hunterName || errors.email) && <FieldError testId="crate-contact-blocked-reason">Add your name and a valid email above to book.</FieldError>}
        {submitError && <FieldError testId="crate-submit-error">{submitError}</FieldError>}
        <Button type="submit" size="lg" className="w-full" disabled={Boolean(dateError) || submitting} data-testid="crate-book-button">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
          {submitting ? 'Forging manifest…' : `Confirm booking · ${formatGbp(totals.total)}`}
        </Button>
      </div>
    </form>
  );
}

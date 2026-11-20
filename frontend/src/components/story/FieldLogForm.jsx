import React, { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Field, FieldError } from '../ui/Field';
import { Button } from '../ui/Button';
import { submitFieldSighting } from '../../services/api';
import { nearestHotspot } from '../map/geo';

const REPORT_MIN = 10;

function validate(form) {
  const errors = {};
  if (form.hunterName.trim().length < 2) errors.hunterName = 'Enter your hunter name or alias (2+ characters).';
  if (!form.location) errors.location = 'Choose the haunted location.';
  if (!form.gearUsed) errors.gearUsed = 'Choose the gear you used.';
  const emf = Number(form.peakEmf);
  if (form.peakEmf === '' || Number.isNaN(emf) || emf < 0 || emf > 999.9) errors.peakEmf = 'Peak EMF must be between 0 and 999.9 mG.';
  if (form.report.trim().length < REPORT_MIN) errors.report = `Describe the encounter in at least ${REPORT_MIN} characters.`;
  return errors;
}

const nearestName = (pin, hotspots) => nearestHotspot(pin, hotspots.filter((h) => typeof h.lat === 'number'))?.spot.name || '';

function pinFields(form, pin, hotspots) {
  if (form.pinMode === 'map' && pin) return { lat: pin.lat, lng: pin.lng };
  if (form.pinMode === 'hotspot') return { hotspotId: hotspots.find((h) => h.name === form.location)?.id };
  return {};
}

export function FieldLogForm({ hotspots, equipment, pin, onRequestMapPin, onCreated }) {
  const [form, setForm] = useState(() => ({
    hunterName: '',
    bandOrCoven: '',
    location: pin ? nearestName(pin, hotspots) : '',
    gearUsed: '',
    peakEmf: '',
    soundtrack: '',
    report: '',
    pinMode: pin ? 'map' : '',
  }));
  const [errors, setErrors] = useState({});

  // A new or moved map pin updates the form in place, keeping anything already typed.
  useEffect(() => {
    if (pin) setForm((f) => ({ ...f, pinMode: 'map', location: f.location || nearestName(pin, hotspots) }));
  }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (key) => (e) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    if (attempted) setErrors(validate(next));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setAttempted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { pinMode, ...fields } = form;
      onCreated(
        await submitFieldSighting({ ...fields, ...pinFields(form, pin, hotspots), bandOrCoven: form.bandOrCoven.trim() || 'Lone Wolf', peakEmf: Number(form.peakEmf) })
      );
    } catch (err) {
      setSubmitError(err.message || 'Could not archive the report.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputProps = (key, testId) => ({
    id: `log-${key}`,
    value: form[key],
    onChange: update(key),
    'aria-invalid': Boolean(errors[key]),
    'data-testid': testId,
    className: 'input-forge',
  });

  return (
    <form data-testid="field-log-form" onSubmit={handleSubmit} noValidate className="card-forge mt-10 animate-modal-in border-ember/30 p-6 sm:p-8">
      <p className="font-blackletter text-3xl text-bone">Submit a field report</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Hunter name *" htmlFor="log-hunterName" error={errors.hunterName} errorTestId="field-log-name-error">
          <input {...inputProps('hunterName', 'field-log-name-input')} placeholder="Dafydd 'Riffreaper' Jones" />
        </Field>
        <Field label="Band / coven" htmlFor="log-bandOrCoven">
          <input {...inputProps('bandOrCoven', 'field-log-band-input')} placeholder="Menai Doom Cult" />
        </Field>
        <Field label="Peak EMF (mG) *" htmlFor="log-peakEmf" error={errors.peakEmf} errorTestId="field-log-emf-error">
          <input {...inputProps('peakEmf', 'field-log-emf-input')} type="number" step="0.1" min="0" max="999.9" placeholder="34.6" inputMode="decimal" />
        </Field>
        <Field label="Haunted location *" htmlFor="log-location" error={errors.location} errorTestId="field-log-location-error">
          <select {...inputProps('location', 'field-log-location-select')}>
            <option value="">Select a haunt…</option>
            {hotspots.map((h) => (
              <option key={h.id} value={h.name}>{h.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Map pin (optional)" htmlFor="log-pinMode" hint={pin && form.pinMode === 'map' ? `Pinned at ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}` : undefined}>
          <select {...inputProps('pinMode', 'field-log-pin-select')}>
            <option value="">No map pin</option>
            <option value="hotspot" disabled={!form.location}>Pin at the haunt above</option>
            <option value="map" disabled={!pin}>{pin ? 'My pin from the live map' : 'Tap the live map first'}</option>
          </select>
          <button type="button" data-testid="field-log-map-pin-link" onClick={onRequestMapPin} className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-spectral hover:text-bone">
            {pin ? 'Move pin on the map' : 'Tap the live map'} →
          </button>
        </Field>
        <Field label="Gear used *" htmlFor="log-gearUsed" error={errors.gearUsed} errorTestId="field-log-gear-error">
          <select {...inputProps('gearUsed', 'field-log-gear-select')}>
            <option value="">Select a rig…</option>
            {equipment.map((eq) => (
              <option key={eq.slug} value={eq.name}>{eq.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Hunt soundtrack" htmlFor="log-soundtrack">
          <input {...inputProps('soundtrack', 'field-log-soundtrack-input')} placeholder="Sleep — Dopesmoker" />
        </Field>
        <Field
          label="Encounter report *"
          htmlFor="log-report"
          error={errors.report}
          errorTestId="field-log-report-error"
          hint={`${form.report.trim().length}/${REPORT_MIN}+ characters`}
          className="sm:col-span-2 lg:col-span-3"
        >
          <textarea {...inputProps('report', 'field-log-report-input')} rows={4} placeholder="Cold spots, EVP voices, shadow figures…" />
        </Field>
      </div>
      {submitError && <FieldError testId="field-log-submit-error">{submitError}</FieldError>}
      <Button type="submit" className="mt-6" disabled={submitting} data-testid="field-log-submit-button">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Archiving…' : 'Publish field report'}
      </Button>
    </form>
  );
}

import React from 'react';
import { Field, FieldError } from '../ui/Field';
import { isoDay } from '../../lib/pricing';
import { cx } from '../../lib/format';

export const PICKUP_OPTIONS = [
  'Forge Bunker (Behind Llanfairpwll 58-Letter Station)',
  'Menai Suspension Bridge Layby Midnight Drop',
  'St. Tysilio Causeway Coven Van Handover',
  'Bryn Celli Ddu Car Park Twilight Drop',
];

export function CrateDateFields({ form, update, nights, dateError }) {
  return (
    <fieldset>
      <legend className="label-forge">Rental dates</legend>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="crate-pickup-date" className="sr-only">Pickup date</label>
          <input id="crate-pickup-date" type="date" min={isoDay(0)} value={form.pickupDate} onChange={update('pickupDate')} aria-invalid={Boolean(dateError)} data-testid="crate-pickup-date-input" className="input-forge font-mono" />
          <span className="mt-1 block text-xs text-ash">Pickup</span>
        </div>
        <div>
          <label htmlFor="crate-return-date" className="sr-only">Return date</label>
          <input id="crate-return-date" type="date" value={form.returnDate} onChange={update('returnDate')} aria-invalid={Boolean(dateError)} data-testid="crate-return-date-input" className="input-forge font-mono" />
          <span className="mt-1 block text-xs text-ash">Return</span>
        </div>
      </div>
      {dateError ? (
        <FieldError testId="crate-date-error">{dateError}</FieldError>
      ) : (
        <p data-testid="crate-nights-display" className="mt-1.5 text-xs font-bold text-spectral">
          {nights} {nights === 1 ? 'night' : 'nights'}
          {nights >= 3 ? ' · 15% multi-night discount applied' : ' · 3+ nights unlocks 15% off'}
        </p>
      )}
    </fieldset>
  );
}

export function CrateLogisticsFields({ form, update, hotspots }) {
  return (
    <div className="grid gap-4">
      <Field label="Pickup / drop point" htmlFor="crate-pickup-location">
        <select id="crate-pickup-location" value={form.pickupLocation} onChange={update('pickupLocation')} data-testid="crate-pickup-location-select" className="input-forge">
          {PICKUP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </Field>
      <Field label="Target haunt (free field map)" htmlFor="crate-target-hotspot">
        <select id="crate-target-hotspot" value={form.targetHotspot} onChange={update('targetHotspot')} data-testid="crate-target-hotspot-select" className="input-forge">
          {hotspots.map((h) => (
            <option key={h.id} value={h.name}>{h.name}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

export function CrateAddonPicker({ addons, selected, onToggle }) {
  return (
    <fieldset>
      <legend className="label-forge">Ritual add-ons</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(addons).map(([id, addon]) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              data-testid={`crate-addon-${id}`}
              onClick={() => onToggle(id)}
              className={cx(
                'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                active ? 'border-spectral/60 bg-spectral/10 text-bone' : 'border-rim bg-void/60 text-ash hover:border-bone/30'
              )}
            >
              <span>{addon.name}</span>
              <span className="shrink-0 font-mono text-xs text-brass">+£{addon.price}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CrateContactFields({ form, update, errors }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Hunter name *" htmlFor="crate-name" error={errors.hunterName} errorTestId="crate-name-error">
        <input id="crate-name" value={form.hunterName} onChange={update('hunterName')} placeholder="Rhys Blackwood" aria-invalid={Boolean(errors.hunterName)} data-testid="crate-name-input" className="input-forge" autoComplete="name" />
      </Field>
      <Field label="Email *" htmlFor="crate-email" error={errors.email} errorTestId="crate-email-error">
        <input id="crate-email" type="email" value={form.email} onChange={update('email')} placeholder="rhys@doomcoven.wales" aria-invalid={Boolean(errors.email)} data-testid="crate-email-input" className="input-forge" autoComplete="email" />
      </Field>
      <Field label="Band / coven" htmlFor="crate-band" className="sm:col-span-2">
        <input id="crate-band" value={form.bandOrCoven} onChange={update('bandOrCoven')} placeholder="Sons of Anglesey" data-testid="crate-band-input" className="input-forge" />
      </Field>
      <Field label="Notes" htmlFor="crate-notes" className="sm:col-span-2">
        <input id="crate-notes" value={form.notes} onChange={update('notes')} placeholder="Need a 6.35mm jack for the fuzz pedal…" data-testid="crate-notes-input" className="input-forge" />
      </Field>
    </div>
  );
}

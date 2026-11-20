import React, { useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { FieldError } from '../ui/Field';
import { Reveal } from '../ui/Reveal';

export function HotspotChips({ chips, onPick, disabled, testIdPrefix }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((spot) => (
        <button
          key={spot.id}
          type="button"
          disabled={disabled}
          data-testid={`${testIdPrefix}-${spot.id}`}
          onClick={() => onPick(spot.name)}
          className="chip max-w-full border-white/15 bg-pit text-ash transition-colors hover:border-spectral hover:text-spectral disabled:opacity-45"
        >
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{spot.name}</span>
        </button>
      ))}
    </div>
  );
}

export function IntelSearchForm({ query, onQueryChange, onSubmit, loading, chips }) {
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setError('Name a haunt with at least 2 characters.');
      return;
    }
    setError('');
    onSubmit(q);
  }

  return (
    <Reveal delay={150} className="mt-12">
      <form data-testid="intel-search-form" onSubmit={handleSubmit} noValidate className="card-forge p-5 sm:p-6">
        <label htmlFor="intel-query" className="label-forge">Where do the dead walk?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="intel-query"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              if (error) setError('');
            }}
            placeholder="Name a haunt… e.g. Beaumaris Gaol"
            aria-invalid={Boolean(error)}
            aria-describedby="intel-query-error"
            maxLength={120}
            data-testid="intel-search-input"
            className="input-forge h-14 text-base"
          />
          <Button type="submit" size="lg" disabled={loading} data-testid="intel-search-button" className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Summoning…' : 'Summon Intel'}
          </Button>
        </div>
        <FieldError id="intel-query-error" testId="intel-query-error">{error}</FieldError>
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">Quick picks</p>
          <HotspotChips chips={chips} onPick={(name) => { setError(''); onSubmit(name); }} disabled={loading} testIdPrefix="intel-chip" />
        </div>
      </form>
    </Reveal>
  );
}

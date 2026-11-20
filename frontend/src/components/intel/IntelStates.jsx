import React from 'react';
import { Ghost, RefreshCw, Radio } from 'lucide-react';
import { Button } from '../ui/Button';
import { HotspotChips } from './IntelSearchForm';

export function IntelLoading({ query }) {
  return (
    <div data-testid="intel-loading" role="status">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-spectral">
        <Radio className="h-4 w-4 animate-pulse" /> Summoning echoes of “{query}”…
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-forge animate-pulse p-6" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="h-3 w-24 rounded bg-steel" />
            <div className="mt-5 h-5 w-4/5 rounded bg-steel" />
            <div className="mt-3 h-3 w-full rounded bg-steel/70" />
            <div className="mt-2 h-3 w-2/3 rounded bg-steel/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IntelError({ onRetry }) {
  return (
    <div data-testid="intel-error" role="alert" className="card-forge flex flex-col items-start gap-5 border-danger/40 p-7 sm:flex-row sm:items-center">
      <Ghost className="h-10 w-10 shrink-0 text-danger" strokeWidth={1.4} />
      <div className="flex-1">
        <p data-testid="intel-error-message" className="font-blackletter text-3xl text-bone">The spirits are silent. Try again shortly.</p>
        <p className="mt-1 text-sm text-ash">The live search could not be reached. The rest of the Forge still works.</p>
      </div>
      <Button variant="secondary" data-testid="intel-retry-button" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </div>
  );
}

export function IntelEmpty({ chips, onPick }) {
  return (
    <div data-testid="intel-empty" className="card-forge p-7">
      <p data-testid="intel-empty-message" className="font-blackletter text-3xl text-bone">No echoes found for this place.</p>
      <p className="mt-2 text-sm text-ash">Try a known haunt instead:</p>
      <div className="mt-4">
        <HotspotChips chips={chips} onPick={onPick} testIdPrefix="intel-empty-chip" />
      </div>
    </div>
  );
}

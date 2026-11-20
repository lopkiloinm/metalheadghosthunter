import React, { useEffect, useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { IntelSearchForm } from './IntelSearchForm';
import { IntelResults } from './IntelResults';
import { IntelEmpty, IntelError, IntelLoading } from './IntelStates';
import { useIntel } from '../../hooks/useIntel';

export function IntelSection({ hotspots, equipment, request, onAddToCrate }) {
  const intel = useIntel();
  const [query, setQuery] = useState('');
  const chips = hotspots;

  const run = (q) => {
    setQuery(q);
    intel.search(q);
  };

  useEffect(() => {
    if (request) run(request.query);
  }, [request]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="intel" data-testid="intel-section" className="relative scroll-mt-24 py-24 lg:py-32">
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-40" />
      <div className="shell relative">
        <SectionHeader chapter="V" overline="Spectre Intel · live" title="Summon the lore of any haunt">
          <p>Live dispatches from the web on any haunted place, read through our spectral filter. Every dossier names the rigs it calls for.</p>
        </SectionHeader>

        <IntelSearchForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={run}
          loading={intel.status === 'loading'}
          chips={chips}
        />

        <div className="mt-12" aria-live="polite">
          {intel.status === 'loading' && <IntelLoading query={intel.query} />}
          {intel.status === 'error' && <IntelError onRetry={() => intel.search(intel.query)} />}
          {intel.status === 'empty' && <IntelEmpty chips={chips} onPick={run} />}
          {intel.status === 'success' && <IntelResults data={intel.data} equipment={equipment} onAddToCrate={onAddToCrate} />}
        </div>
      </div>
    </section>
  );
}

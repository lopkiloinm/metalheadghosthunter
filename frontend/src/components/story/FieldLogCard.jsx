import React from 'react';
import { Disc3, Radio } from 'lucide-react';
import { cx } from '../../lib/format';

export function FieldLogCard({ log, fresh }) {
  return (
    <article data-testid={`field-log-card-${log.id}`} className={cx('card-forge flex h-full flex-col p-6', fresh && 'border-spectral/60 shadow-spectral')}>
      <div className="flex items-center justify-between gap-2">
        <span className="chip border-ember/40 bg-ember/10 text-ember">
          <Radio className="h-3.5 w-3.5" /> Peak {log.peakEmf} mG
        </span>
        {typeof log.lat === 'number' && <span data-testid={`field-log-pinned-${log.id}`} className="chip border-spectral/40 text-spectral">On the map</span>}
        {fresh && <span data-testid="field-log-new-badge" className="chip border-spectral/50 text-spectral">New</span>}
      </div>
      <h3 className="mt-5 font-display text-xl font-black uppercase leading-tight tracking-tight text-bone">{log.location}</h3>
      <p className="mt-1 font-mono text-[11px] text-spectral">{log.gearUsed}</p>
      <blockquote className="mt-4 flex-1 leading-relaxed text-ash">“{log.report}”</blockquote>
      <footer className="mt-6 border-t border-white/[0.06] pt-4">
        <p className="font-bold text-bone">{log.hunterName}</p>
        <p className="text-sm text-brass">{log.bandOrCoven}</p>
        {log.soundtrack && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ash">
            <Disc3 className="h-3 w-3 text-ember" aria-hidden="true" />
            <span className="truncate">{log.soundtrack}</span>
          </p>
        )}
      </footer>
    </article>
  );
}

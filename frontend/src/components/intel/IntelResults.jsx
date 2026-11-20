import React from 'react';
import { ExternalLink, Plus, ScrollText, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

function DossierCard({ result, index }) {
  return (
    <article data-testid={`intel-result-card-${index}`} className="card-forge card-lift flex h-full min-w-0 flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="overline text-ember">Dossier {String(index + 1).padStart(2, '0')}</span>
        <span data-testid={`intel-result-source-${index}`} className="chip max-w-[60%] border-spectral/40 text-spectral">
          <span className="truncate">{result.source}</span>
        </span>
      </div>
      <h3 className="mt-4 break-words font-display text-xl font-black uppercase leading-tight tracking-tight text-bone">{result.title}</h3>
      <p className="mt-3 flex-1 break-words text-sm leading-relaxed text-ash">{result.snippet || 'No transcript survived.'}</p>
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`intel-result-link-${index}`}
        className="mt-5 inline-flex items-center gap-1.5 self-start font-mono text-xs font-semibold uppercase tracking-widest text-spectral hover:text-bone"
      >
        Read the source <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}

function RecommendedArsenal({ slugs, equipment, onAddToCrate }) {
  const items = slugs.map((s) => equipment.find((e) => e.slug === s)).filter(Boolean);
  if (!items.length) return null;
  return (
    <aside data-testid="intel-recommended" className="card-forge border-ember/40 bg-iron p-6">
      <p className="overline flex items-center gap-2 text-ember">
        <Zap className="h-3.5 w-3.5" /> Recommended Arsenal
      </p>
      <p className="mt-2 text-sm text-ash">Matched to the omens in these dossiers.</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.slug} data-testid={`intel-recommended-${item.slug}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-void/60 p-3.5">
            <span className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.accentColor }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-extrabold uppercase tracking-wide text-bone">{item.name}</p>
              <p className="font-mono text-[11px] text-ash">£{item.dailyRate}/night</p>
            </div>
            <Button size="sm" data-testid={`intel-recommended-add-${item.slug}`} onClick={() => onAddToCrate(item)} aria-label={`Add ${item.name} to crate`}>
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add to Crate</span>
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function IntelResults({ data, equipment, onAddToCrate }) {
  return (
    <div data-testid="intel-results">
      <p className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ash">
        <ScrollText className="h-4 w-4 text-brass" /> {data.results.length} echoes for “{data.query}”
        {data.cached && <span data-testid="intel-cached-badge" className="chip border-brass/40 text-brass">Cached</span>}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:col-span-8">
          {data.results.map((r, i) => (
            <DossierCard key={r.url} result={r} index={i} />
          ))}
        </div>
        <div className="min-w-0 xl:col-span-4">
          <div className="xl:sticky xl:top-28">
            <RecommendedArsenal slugs={data.recommended} equipment={equipment} onAddToCrate={onAddToCrate} />
          </div>
        </div>
      </div>
    </div>
  );
}

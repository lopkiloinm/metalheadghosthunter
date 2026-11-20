import React from 'react';
import { Check, Flame, ShieldAlert } from 'lucide-react';

export function BundlesSection({ bundles, equipment, onLoadBundle }) {
  const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));

  return (
    <section id="bundles" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-crimson">
            // PRE-FORGED COVEN LOADOUTS
          </p>
          <h2 className="mt-2 font-gothic text-3xl text-bone sm:text-4xl">
            HEAVY METAL HUNTING RIGS
          </h2>
        </div>
        <p className="max-w-md text-sm text-bone/65">
          Renting for a band, documentary crew, or a 3+ night Anglesey binge? Stack any bundle with
          our automatic <span className="font-semibold text-brass">15% Riff Lord Discount</span> on
          3+ nights.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {bundles.map((bundle, idx) => {
          const isFeatured = idx === 1;
          return (
            <div
              key={bundle.id}
              className={`forge-card relative flex flex-col rounded-xl p-6 ${
                isFeatured ? 'border-crimson/60 shadow-crimson' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                    isFeatured
                      ? 'bg-crimson text-white'
                      : 'border border-brass/40 bg-brass/10 text-brass'
                  }`}
                >
                  {bundle.badge}
                </span>
                <ShieldAlert className="h-4 w-4 text-bone/40" />
              </div>

              <h3 className="mt-4 font-display text-xl font-extrabold tracking-wide text-bone">
                {bundle.name}
              </h3>
              <p className="mt-2 text-sm text-bone/70">{bundle.tagline}</p>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-bone">
                  £{bundle.dailyRate}
                </span>
                <span className="font-mono text-xs text-bone/50">/ night</span>
                <span className="ml-2 font-mono text-xs text-bone/40 line-through">
                  £{bundle.regularRate}
                </span>
              </div>

              <ul className="mt-5 flex-1 space-y-2 border-t border-white/10 pt-4 text-sm text-bone/80">
                {bundle.equipmentSlugs.map((slug) => (
                  <li key={slug} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-ecto" />
                    <span className="truncate font-mono text-xs">
                      {eqBySlug[slug]?.name || slug}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 font-mono text-[11px] text-brass/90">
                Ideal for: {bundle.recommendedFor}
              </p>

              <button
                type="button"
                onClick={() => onLoadBundle(bundle)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-mono text-xs font-bold uppercase tracking-widest transition ${
                  isFeatured
                    ? 'bg-crimson text-white shadow-crimson hover:bg-[#ff4260]'
                    : 'border border-crimson/60 bg-crimson/10 text-crimson hover:bg-crimson hover:text-white'
                }`}
              >
                <Flame className="h-4 w-4" />
                <span>Load {bundle.equipmentSlugs.length} Rigs Into Crate</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

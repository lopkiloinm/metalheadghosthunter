import React from 'react';
import { Check, Flame } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { cx } from '../../lib/format';

export function BundlesSection({ bundles, equipment, onLoadBundle }) {
  const eqBySlug = Object.fromEntries(equipment.map((e) => [e.slug, e]));

  return (
    <section id="bundles" data-testid="bundles-section" className="shell scroll-mt-24 py-24 lg:py-32">
      <SectionHeader chapter="III" overline="Coven Loadouts" title="Pre-forged rigs for the whole band">
        <p>
          Hunting as a crew? Load a bundle in one click. Stack it with the automatic{' '}
          <strong className="text-brass">15% Riff Lord discount</strong> on 3+ nights.
        </p>
      </SectionHeader>

      <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {bundles.map((bundle, idx) => {
          const featured = idx === 1;
          return (
            <Reveal key={bundle.id} delay={idx * 120} className={cx(featured && 'lg:-translate-y-4')}>
              <article
                data-testid={`bundle-card-${bundle.id}`}
                className={cx('card-forge card-lift flex h-full flex-col p-7', featured && 'border-ember/50 bg-iron')}
              >
                <span className={cx('chip self-start', featured ? 'border-ember bg-ember text-ember-ink' : 'border-brass/40 text-brass')}>
                  {bundle.badge}
                </span>
                <h3 className="mt-6 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-bone">{bundle.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ash">{bundle.tagline}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span data-testid={`bundle-price-${bundle.id}`} className="font-display text-5xl font-black text-bone">£{bundle.dailyRate}</span>
                  <span className="font-mono text-xs text-ash">/ night</span>
                  <span className="ml-1 font-mono text-sm text-ash line-through">£{bundle.regularRate}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/[0.06] pt-5">
                  {bundle.equipmentSlugs.map((slug) => (
                    <li key={slug} className="flex items-center gap-2.5 text-sm text-bone">
                      <Check className="h-4 w-4 shrink-0 text-spectral" aria-hidden="true" />
                      <span className="truncate">{eqBySlug[slug]?.name || slug}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-ash">Ideal for: {bundle.recommendedFor}</p>
                <Button
                  variant={featured ? 'primary' : 'secondary'}
                  className="mt-6 w-full"
                  data-testid={`bundle-load-button-${bundle.id}`}
                  onClick={() => onLoadBundle(bundle)}
                >
                  <Flame className="h-4 w-4" /> Load {bundle.equipmentSlugs.length} rigs
                </Button>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

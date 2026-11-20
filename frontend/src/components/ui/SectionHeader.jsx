import React from 'react';
import { Reveal } from './Reveal';

export function SectionHeader({ chapter, overline, title, children, aside }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <Reveal className="lg:col-span-7">
        <div className="flex items-center gap-4">
          <span className="font-blackletter text-4xl leading-none text-ember" aria-hidden="true">
            {chapter}
          </span>
          <span className="h-px w-10 bg-ember/50" aria-hidden="true" />
          <span className="overline text-spectral">{overline}</span>
        </div>
        <h2 className="mt-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight text-bone sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={120} className="space-y-4 text-base leading-relaxed text-ash lg:col-span-5">
        {children}
        {aside}
      </Reveal>
    </div>
  );
}

import React from 'react';
import { Reveal } from './Reveal';
import { AlbumCover, BandLogo } from './BandLogo';

const COVERS = {
  II: ['armoury', 'A stone forge glowing with embers, ghost-hunting tools hanging in the dark'],
  III: ['loadouts', 'Three hooded figures with lanterns in a foggy Welsh field'],
  IV: ['raid', "The Marquess of Anglesey's Column in fog under a pale moon"],
  'IV·II': ['map', 'A burnt chart of the Menai Strait with glowing currents'],
  V: ['intel', 'An old radio on a windowsill exhaling a figure of static smoke'],
  VI: ['fieldlogs', 'A field journal on wet gravestones in a foggy churchyard'],
};

export function SectionHeader({ chapter, overline, title, logo, children, aside }) {
  const cover = COVERS[chapter];
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      {cover && (
        <Reveal className="lg:col-span-4 xl:col-span-3">
          <AlbumCover src={`/assets/cover-${cover[0]}.webp`} alt={`Chapter ${chapter} album cover: ${cover[1]}`} testId={`chapter-cover-${cover[0]}`} />
        </Reveal>
      )}
      <Reveal className={cover ? 'min-w-0 lg:col-span-8 xl:col-span-5' : 'lg:col-span-7'}>
        <div className="flex items-center gap-4">
          <span className="font-blackletter text-4xl leading-none text-ember" aria-hidden="true">
            {chapter}
          </span>
          <span className="h-px w-10 bg-ember/50" aria-hidden="true" />
          <span className="overline text-spectral">{overline}</span>
        </div>
        {logo && (
          <div className="mt-5">
            <BandLogo text={logo} testId={`band-logo-${cover ? cover[0] : chapter}`} />
          </div>
        )}
        <h2 className={logo ? 'mt-3 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-bone sm:text-3xl' : 'mt-4 font-display text-4xl font-black uppercase leading-[0.92] tracking-tight text-bone sm:text-5xl lg:text-6xl'}>
          {title}
        </h2>
      </Reveal>
      <Reveal delay={120} className={`space-y-4 text-base leading-relaxed text-ash ${cover ? 'max-w-2xl lg:col-span-12 xl:col-span-4 xl:max-w-none' : 'lg:col-span-5'}`}>
        {children}
        {aside}
      </Reveal>
    </div>
  );
}

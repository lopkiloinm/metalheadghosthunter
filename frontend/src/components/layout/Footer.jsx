import React from 'react';
import { Flame, Skull } from 'lucide-react';

export function Footer({ backendOnline, storageMode }) {
  return (
    <footer className="border-t border-white/[0.06] bg-pit py-14">
      <div className="shell grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <div className="flex items-center gap-3">
            <Skull className="h-5 w-5 text-ember" />
            <span className="font-blackletter text-3xl text-bone">Llanfair Spectre Forge</span>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ash">
            Bunker Unit 6, behind Llanfairpwllgwyngyll station, Anglesey LL61 5UJ. Stay heavy, respect the dead, and return
            your gear before sunrise.
          </p>
        </div>
        <div className="flex flex-col gap-2 font-mono text-xs text-ash md:col-span-5 md:items-end">
          <span data-testid="backend-status" className="inline-flex items-center gap-2 text-brass">
            <Flame className="h-3.5 w-3.5 text-ember" />
            {backendOnline ? `Backend online · ${storageMode}` : 'Offline mode · local data'}
          </span>
          <span>© {new Date().getFullYear()} Spectre Forge · Ynys Môn</span>
        </div>
      </div>
    </footer>
  );
}

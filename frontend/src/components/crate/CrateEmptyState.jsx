import React from 'react';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { Button } from '../ui/Button';

export function CrateEmptyState({ onBrowse }) {
  return (
    <div data-testid="crate-empty-state" className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-ember/40">
        <PackageOpen className="h-10 w-10 text-ember" strokeWidth={1.4} />
      </span>
      <p className="mt-8 font-blackletter text-4xl text-bone">The crate lies empty</p>
      <p className="mt-3 max-w-xs leading-relaxed text-ash">
        No rigs yet. Pick instruments from the Armoury or load a pre-forged Coven Loadout.
      </p>
      <Button size="lg" className="mt-8" data-testid="crate-empty-cta" onClick={onBrowse}>
        Browse the Armoury <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

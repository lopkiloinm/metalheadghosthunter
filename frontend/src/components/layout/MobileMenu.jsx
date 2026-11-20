import React from 'react';
import { NAV_LINKS } from './navLinks';
import { BookingsButton, CrateButton, EcoToggle, HauntingToggle, SynthToggle } from './NavControls';

export function MobileMenu({ onClose, crateCount, onOpenCrate, onOpenBookings, synth, eco, haunting }) {
  const run = (fn) => () => {
    onClose();
    fn();
  };

  return (
    <div data-testid="mobile-menu" className="animate-menu-in border-t border-white/[0.06] bg-pit lg:hidden">
      <nav aria-label="Mobile" className="shell grid gap-1 py-4">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={onClose}
            data-testid={`mobile-nav-link-${l.href.slice(1)}`}
            className="flex items-baseline gap-3 rounded-xl px-2 py-2.5 font-display text-2xl font-extrabold uppercase tracking-tight text-bone transition-colors hover:text-ember"
          >
            <span className="font-blackletter text-base text-ember">{l.chapter}</span>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="shell grid gap-2 border-t border-white/[0.06] py-4 sm:grid-cols-2">
        <CrateButton count={crateCount} onClick={run(onOpenCrate)} testId="mobile-menu-crate-button" badgeTestId="mobile-menu-crate-count" wide />
        <BookingsButton onClick={run(onOpenBookings)} testId="mobile-menu-bookings-button" wide />
        <SynthToggle active={synth.active} onToggle={synth.onToggle} testId="mobile-synth-toggle-button" wide />
        <EcoToggle eco={eco.on} isAuto={eco.isAuto} onToggle={eco.onToggle} testId="mobile-eco-toggle-button" wide />
        <HauntingToggle on={haunting.on} onToggle={haunting.onToggle} testId="mobile-haunting-toggle-button" />
      </div>
    </div>
  );
}

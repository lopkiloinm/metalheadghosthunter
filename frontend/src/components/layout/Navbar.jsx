import React, { useState } from 'react';
import { Menu, Skull, X } from 'lucide-react';
import { BookingsButton, CrateButton, EcoToggle, SynthToggle } from './NavControls';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS } from './navLinks';

const VILLAGE = 'LLANFAIRPWLLGWYNGYLLGOGERYCHWYRNDROBWLLLLANTYSILIOGOGOGOCH';

function Ticker() {
  const line = `Forge bunker open until 03:33 GMT  ✕  ${VILLAGE}  ✕  Return gear before sunrise  ✕  `;
  return (
    <div className="overflow-hidden border-t border-white/[0.05] bg-void/80 py-1.5" aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-ash">
        <span className="pr-4">{line}</span>
        <span className="pr-4">{line}</span>
      </div>
    </div>
  );
}

export function Navbar({ crateCount, onOpenCrate, onOpenBookings, synth, eco, backendOnline }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <a href="#top" data-testid="navbar-brand" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember/50 bg-ember/10 transition-transform duration-300 group-hover:rotate-12">
            <Skull className="h-4 w-4 text-ember" />
          </span>
          <span className="min-w-0">
            <span className="block truncate whitespace-nowrap pt-1 font-blackletter text-2xl leading-none text-bone">Spectre Forge</span>
            <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
              Llanfair · Wales
              <span
                data-testid="backend-status-indicator"
                title={backendOnline ? 'Backend online' : 'Offline mode (local data)'}
                className={`inline-block h-1.5 w-1.5 rounded-full ${backendOnline ? 'bg-spectral' : 'bg-brass'}`}
              />
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} data-testid={`nav-link-${l.href.slice(1)}`} className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-ash transition-colors hover:text-ember">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <SynthToggle active={synth.active} onToggle={synth.onToggle} testId="synth-toggle-button" />
            <EcoToggle eco={eco.on} isAuto={eco.isAuto} onToggle={eco.onToggle} testId="eco-mode-toggle-button" />
            <BookingsButton onClick={onOpenBookings} testId="my-bookings-button" />
          </div>
          <CrateButton count={crateCount} onClick={onOpenCrate} testId="navbar-crate-button" badgeTestId="navbar-crate-count" />
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            className="btn-icon xl:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Ticker />
      {menuOpen && (
        <MobileMenu
          onClose={() => setMenuOpen(false)}
          crateCount={crateCount}
          onOpenCrate={onOpenCrate}
          onOpenBookings={onOpenBookings}
          synth={synth}
          eco={eco}
        />
      )}
    </header>
  );
}

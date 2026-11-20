import React, { useState } from 'react';
import { Menu, Skull, X } from 'lucide-react';
import { CrateButton } from './NavControls';
import { NavMenu } from './NavMenu';
import { MobileMenu } from './MobileMenu';
import { PRIMARY_LINKS } from './navLinks';
import { useActiveSection, useScrolled } from '../../hooks/useNavState';
import { cx } from '../../lib/format';

const SECTION_IDS = PRIMARY_LINKS.map((l) => l.href.slice(1));

function Brand() {
  return (
    <a href="#top" data-testid="navbar-brand" className="group flex shrink-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember/50 bg-ember/10 transition-transform duration-300 group-hover:rotate-12">
        <Skull className="h-4 w-4 text-ember" />
      </span>
      <span className="whitespace-nowrap pt-1 font-blackletter text-2xl leading-none text-bone">Spectre Forge</span>
    </a>
  );
}

function PrimaryNav() {
  const active = useActiveSection(SECTION_IDS);
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {PRIMARY_LINKS.map((l) => {
        const on = active === l.href.slice(1);
        return (
          <a
            key={l.href}
            href={l.href}
            aria-current={on ? 'true' : undefined}
            data-testid={`nav-link-${l.href.slice(1)}`}
            className={cx(
              'relative whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors xl:px-4',
              on ? 'text-bone' : 'text-ash hover:text-bone'
            )}
          >
            {l.label}
            <span aria-hidden="true" className={cx('absolute inset-x-3.5 -bottom-0.5 h-px bg-ember transition-transform duration-300 xl:inset-x-4', on ? 'scale-x-100' : 'scale-x-0')} />
          </a>
        );
      })}
    </nav>
  );
}

export function Navbar({ crateCount, onOpenCrate, onOpenBookings, synth, eco, backendOnline }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();

  return (
    <header
      data-testid="site-header"
      className={cx(
        'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300',
        scrolled || menuOpen ? 'glass border-white/[0.07]' : 'border-transparent bg-void/40'
      )}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1360px] items-center justify-between gap-6 px-5 sm:px-8">
        <Brand />
        <PrimaryNav />
        <div className="flex shrink-0 items-center gap-2.5">
          <CrateButton count={crateCount} onClick={onOpenCrate} testId="navbar-crate-button" badgeTestId="navbar-crate-count" />
          <div className="hidden lg:block">
            <NavMenu onOpenBookings={onOpenBookings} synth={synth} eco={eco} backendOnline={backendOnline} />
          </div>
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            className="btn-icon lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <MobileMenu onClose={() => setMenuOpen(false)} crateCount={crateCount} onOpenCrate={onOpenCrate} onOpenBookings={onOpenBookings} synth={synth} eco={eco} />
      )}
    </header>
  );
}

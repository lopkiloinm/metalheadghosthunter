import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatGbp } from '../../lib/format';

function QtyButton({ label, onClick, testId, children }) {
  return (
    <button type="button" aria-label={label} data-testid={testId} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-full border border-rim text-bone transition-colors hover:border-ember hover:text-ember">
      {children}
    </button>
  );
}

export function CrateLineItems({ items, nights, onSetQty, onRemove }) {
  return (
    <ul className="space-y-3" data-testid="crate-items">
      {items.map(({ item, quantity }) => (
        <li key={item.slug} data-testid={`crate-item-${item.slug}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-void/60 p-3.5">
          <span className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.accentColor }} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-extrabold uppercase tracking-wide text-bone">{item.name}</p>
            <p className="font-mono text-[11px] text-ash">
              £{item.dailyRate}/night{nights > 0 && ` · ${formatGbp(item.dailyRate * quantity * nights)}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <QtyButton label={`Decrease ${item.name}`} testId={`crate-qty-decrease-${item.slug}`} onClick={() => onSetQty(item.slug, quantity - 1)}>
              <Minus className="h-3.5 w-3.5" />
            </QtyButton>
            <span data-testid={`crate-qty-${item.slug}`} className="w-6 text-center font-mono text-sm font-semibold text-bone">
              {quantity}
            </span>
            <QtyButton label={`Increase ${item.name}`} testId={`crate-qty-increase-${item.slug}`} onClick={() => onSetQty(item.slug, quantity + 1)}>
              <Plus className="h-3.5 w-3.5" />
            </QtyButton>
            <button type="button" aria-label={`Remove ${item.name}`} data-testid={`crate-remove-${item.slug}`} onClick={() => onRemove(item.slug)} className="ml-1 p-1.5 text-ash transition-colors hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

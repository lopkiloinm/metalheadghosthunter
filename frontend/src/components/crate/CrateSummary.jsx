import React from 'react';
import { formatGbp } from '../../lib/format';
import { DISCOUNT_MIN_NIGHTS } from '../../lib/pricing';

function Row({ label, value, testId, className = 'text-ash' }) {
  return (
    <div data-testid={testId} className={`flex justify-between gap-4 ${className}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export function CrateSummary({ totals, nights }) {
  const nightsToDiscount = DISCOUNT_MIN_NIGHTS - nights;
  return (
    <div data-testid="crate-summary" className="space-y-1.5 text-sm">
      <Row label={`Gear · ${nights} ${nights === 1 ? 'night' : 'nights'}`} value={formatGbp(totals.subtotal)} testId="crate-subtotal" />
      {totals.discount > 0 ? (
        <Row label="Riff Lord multi-night discount (-15%)" value={`-${formatGbp(totals.discount)}`} testId="crate-discount-line" className="font-bold text-spectral" />
      ) : (
        nights > 0 && (
          <p data-testid="crate-discount-hint" className="text-xs text-ash">
            Add {nightsToDiscount} more {nightsToDiscount === 1 ? 'night' : 'nights'} to unlock 15% off.
          </p>
        )
      )}
      {totals.addonsTotal > 0 && <Row label="Ritual add-ons" value={formatGbp(totals.addonsTotal)} testId="crate-addons-total" />}
      <div className="flex items-baseline justify-between gap-4 border-t border-white/[0.06] pt-2.5">
        <span className="font-display text-lg font-black uppercase tracking-wide text-bone">Total</span>
        <span data-testid="crate-total" className="font-display text-3xl font-black text-ember">
          {formatGbp(totals.total)}
        </span>
      </div>
      <Row label="Refundable deposit (card hold at pickup)" value={formatGbp(totals.deposit)} testId="crate-deposit" className="text-xs text-ash" />
    </div>
  );
}

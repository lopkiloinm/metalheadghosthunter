import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { formatGbp } from '../../lib/format';

function CancelControls({ code, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function confirm() {
    setCancelling(true);
    try {
      await onCancel(code);
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button type="button" data-testid={`booking-cancel-${code}`} onClick={() => setConfirming(true)} className="btn btn-sm border border-danger/50 text-danger hover:bg-danger hover:text-void">
        <Trash2 className="h-3.5 w-3.5" /> Cancel
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button type="button" data-testid={`booking-cancel-keep-${code}`} onClick={() => setConfirming(false)} className="btn btn-sm btn-ghost">
        Keep
      </button>
      <button type="button" data-testid={`booking-cancel-confirm-${code}`} onClick={confirm} disabled={cancelling} className="btn btn-sm bg-danger text-void hover:bg-danger/90">
        {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Confirm cancel
      </button>
    </div>
  );
}

export function BookingCard({ booking: b, onCancel }) {
  return (
    <article data-testid={`booking-card-${b.bookingCode}`} className="rounded-2xl border border-white/[0.06] bg-void/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-black tracking-tight text-bone">{b.bookingCode}</p>
          <span className="chip mt-1 border-spectral/40 text-spectral">{b.status}</span>
        </div>
        <CancelControls code={b.bookingCode} onCancel={onCancel} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="inline text-ash">Hunter: </dt><dd className="inline text-bone">{b.hunterName}</dd></div>
        <div><dt className="inline text-ash">Pickup: </dt><dd className="inline text-bone">{b.pickupDate} · {b.nights}n</dd></div>
        <div className="sm:col-span-2"><dt className="inline text-ash">Drop point: </dt><dd className="inline text-brass">{b.pickupLocation}</dd></div>
      </dl>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {(b.items || []).map((it) => (
          <li key={it.slug} className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-bone">
            {it.quantity}× {it.name}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-white/[0.06] pt-3 text-sm">
        <span className="text-ash">Total</span>
        <span className="font-display text-xl font-black text-ember">{formatGbp(b.totalGbp)}</span>
      </div>
    </article>
  );
}

import React from 'react';
import { Skull } from 'lucide-react';

export function ThreatMeter({ value, max = 5, label = 'Threat' }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${label} ${value} of ${max}`} role="img">
      {Array.from({ length: max }).map((_, i) => (
        <Skull key={i} className={`h-3.5 w-3.5 ${i < value ? 'text-ember' : 'text-rim'}`} aria-hidden="true" />
      ))}
    </div>
  );
}

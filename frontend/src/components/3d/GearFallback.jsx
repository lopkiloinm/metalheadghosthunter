import { ApparitionShape } from '../haunt/ApparitionShape';
import React, { Component } from 'react';
import { Activity, Mic, Radio, RadioTower, ScanLine, Thermometer } from 'lucide-react';

const GEAR_ICONS = {
  emf: Activity,
  spiritbox: Radio,
  thermal: Thermometer,
  rempod: RadioTower,
  laser: ScanLine,
  evp: Mic,
};

export function GearFallback({ modelKey, accentColor = '#ff5a1f', compact = false, ghost = false }) {
  const Icon = GEAR_ICONS[modelKey] || Activity;
  return (
    <div
      data-testid="webgl-fallback"
      role="img"
      aria-label="Static illustration of the gear (3D unavailable)"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-void"
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 55%, ${accentColor}38, transparent 62%)` }} />
      <div className="scanlines absolute inset-0 opacity-60" />
      {ghost && <ApparitionShape id="fallback" className="absolute right-[12%] top-[8%] h-[80%] w-auto opacity-25" />}
      <div className="absolute aspect-square w-[62%] max-w-[340px] rounded-full border border-white/10" />
      <div className="absolute aspect-square w-[46%] max-w-[250px] rounded-full border border-dashed" style={{ borderColor: `${accentColor}80` }} />
      <Icon className={compact ? 'relative h-14 w-14' : 'relative h-24 w-24'} style={{ color: accentColor }} strokeWidth={1.25} aria-hidden="true" />
      <span className="sr-only">3D preview unavailable; showing a static illustration.</span>
    </div>
  );
}

export class WebGLBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

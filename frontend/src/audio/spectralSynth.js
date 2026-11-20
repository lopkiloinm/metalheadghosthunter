/**
 * Spectral Doom Synthesizer (Web Audio API).
 * Muted by default; a user-toggled 55 Hz drone plus a per-rig distorted riff on Test Fire.
 */

// Semitone offsets for 8 palm-muted sixteenths, then a ringing power chord. Roots are bass-register Hz.
const RIFFS = {
  emf: { root: 41.2, pattern: [0, 0, 0, 3, 0, 0, 5, 3], chord: 0 },
  spiritbox: { root: 46.25, pattern: [0, 0, 1, 0, 0, 1, 6, 0], chord: 1, static: true },
  thermal: { root: 36.71, pattern: [0, 0, 0, 0, 5, 5, 3, 0], chord: 5 },
  rempod: { root: 55, pattern: [0, 12, 0, 10, 0, 7, 0, 6], chord: 0 },
  laser: { root: 49, pattern: [0, 0, 6, 0, 0, 5, 0, 3], chord: 6 },
  evp: { root: 32.7, pattern: [0, 0, 0, 1, 0, 0, 0, -2], chord: -2 },
};
const STEP = 60 / 152 / 4;

function distortionCurve(k = 90) {
  const n = 2048;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

class SpectralSynth {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.isDroneActive = false;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.14;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    } catch {
      return null;
    }
  }

  toggleDoomDrone() {
    if (this.isDroneActive) {
      this.stopDoomDrone();
      return false;
    }
    const ctx = this.ensureContext();
    if (!ctx) return false;
    try {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 185;
      filter.Q.value = 6.5;
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 1.1);

      const osc = (type, freq) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        o.connect(filter);
        return o;
      };
      const nodes = [osc('sawtooth', 55), osc('sawtooth', 55.45), osc('triangle', 82.41)];
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.18;
      lfoGain.gain.value = 55;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      filter.connect(droneGain);
      droneGain.connect(this.master);
      [...nodes, lfo].forEach((n) => n.start());

      this.droneNodes = [...nodes, lfo];
      this.droneGain = droneGain;
      this.isDroneActive = true;
      return true;
    } catch {
      return false;
    }
  }

  stopDoomDrone() {
    if (!this.isDroneActive || !this.ctx) return;
    try {
      this.droneGain?.gain.cancelScheduledValues(this.ctx.currentTime);
      this.droneGain?.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
      const nodes = this.droneNodes || [];
      setTimeout(() => nodes.forEach((n) => { try { n.stop(); n.disconnect(); } catch {} }), 450);
    } catch {}
    this.isDroneActive = false;
  }

  swellDrone(now) {
    if (!this.isDroneActive || !this.droneGain) return;
    const g = this.droneGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.001), now);
    g.linearRampToValueAtTime(0.8, now + 0.7);
    g.linearRampToValueAtTime(0.45, now + 3.2);
  }

  guitarNote(ctx, bus, freq, start, dur, muted) {
    const env = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = muted ? 650 : 2300;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(muted ? 0.55 : 0.7, start + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    [-9, 0, 11].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = cents;
      o.connect(env);
      o.start(start);
      o.stop(start + dur + 0.05);
    });
    env.connect(tone);
    tone.connect(bus);
  }

  subNote(ctx, freq, start, dur) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.9, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  staticBurst(ctx, start) {
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (i % 1600 < 900 ? 1 : 0.25);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(420, start);
    band.frequency.exponentialRampToValueAtTime(2400, start + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    src.connect(band);
    band.connect(g);
    g.connect(this.master);
    src.start(start);
  }

  // Heavier per-rig riff: palm-muted chug, ringing power chord, sub low end and a drone swell.
  playRiff(modelKey = 'emf') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const riff = RIFFS[modelKey] || RIFFS.emf;
      const now = ctx.currentTime + 0.03;
      const shaper = ctx.createWaveShaper();
      shaper.curve = distortionCurve(110);
      shaper.oversample = '4x';
      const cab = ctx.createBiquadFilter();
      cab.type = 'lowpass';
      cab.frequency.value = 3400;
      const post = ctx.createGain();
      post.gain.value = 0.32;
      shaper.connect(cab);
      cab.connect(post);
      post.connect(this.master);

      const hz = (semi) => riff.root * 2 * 2 ** (semi / 12);
      riff.pattern.forEach((semi, i) => {
        const t = now + i * STEP;
        this.guitarNote(ctx, shaper, hz(semi), t, STEP * 0.8, true);
        if (i % 2 === 0) this.subNote(ctx, riff.root * 2 ** (semi / 12), t, STEP * 1.6);
      });
      const ring = now + riff.pattern.length * STEP;
      [0, 7, 12].forEach((iv) => this.guitarNote(ctx, shaper, hz(riff.chord + iv), ring, 1.5, false));
      this.subNote(ctx, riff.root * 2 ** (riff.chord / 12), ring, 1.6);
      if (riff.static) this.staticBurst(ctx, ring + 0.2);
      this.swellDrone(now);
      setTimeout(() => { try { post.disconnect(); } catch {} }, 3200);
    } catch {}
  }

  playOverdrivePulse(modelKey) {
    this.playRiff(modelKey);
  }
}

export const spectralSynth = new SpectralSynth();

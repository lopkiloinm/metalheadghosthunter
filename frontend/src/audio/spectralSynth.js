/**
 * Spectral Doom Synthesizer (Web Audio API)
 * Generates an optional, user-activated 55Hz A1 Doom Drone + Ghost-Box Static Sweep
 * and tactile overdrive audio bursts when inspecting 3D ghost hunting gear.
 */

class SpectralSynth {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.subOsc = null;
    this.lfo = null;
    this.isDroneActive = false;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.14;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleDoomDrone() {
    if (this.isDroneActive) {
      this.stopDoomDrone();
      return false;
    }
    const ctx = this.ensureContext();
    if (!ctx) return false;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 185;
    filter.Q.value = 6.5;

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 1.1);

    // Detuned A1 (55 Hz) + Fifth (82.4 Hz) + Sub (27.5 Hz) Sunn O))) style drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55.0;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 55.45;

    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.value = 82.41;

    // Slow eerie filter LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    sub.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.master);

    osc1.start();
    osc2.start();
    sub.start();
    lfo.start();

    this.droneOsc1 = osc1;
    this.droneOsc2 = osc2;
    this.subOsc = sub;
    this.lfo = lfo;
    this.droneGain = droneGain;
    this.isDroneActive = true;
    return true;
  }

  stopDoomDrone() {
    if (!this.isDroneActive || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain?.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      setTimeout(() => {
        [this.droneOsc1, this.droneOsc2, this.subOsc, this.lfo].forEach((node) => {
          try {
            node?.stop();
            node?.disconnect();
          } catch {}
        });
      }, 400);
    } catch {}
    this.isDroneActive = false;
  }

  playOverdrivePulse(modelKey = 'emf') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (modelKey === 'spiritbox') {
      // Short filtered white-noise FM sweep burst
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i % 1600 < 900 ? 1 : 0.25);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.setValueAtTime(420, now);
      band.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      noise.connect(band);
      band.connect(gain);
      gain.connect(this.master);
      noise.start(now);
      return;
    }

    // Harmonic EMF / REM-Pod / Laser power-on chord
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = modelKey === 'rempod' ? 'sawtooth' : 'square';
    const baseFreq =
      modelKey === 'rempod'
        ? 110
        : modelKey === 'laser'
          ? 660
          : modelKey === 'thermal'
            ? 220
            : 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.22);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.36);
  }
}

export const spectralSynth = new SpectralSynth();

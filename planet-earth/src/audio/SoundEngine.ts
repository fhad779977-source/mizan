/**
 * Generative ambient score and interface sounds, synthesised with Web Audio
 * (no audio files to download). Silent until the visitor opts in.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private started = false;
  enabled = false;

  private ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const length = ctx.sampleRate * 3;
    this.noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      // Brown noise: soft, low rumble.
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return ctx;
  }

  private startAmbience() {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(this.master!);

    // Deep pad: a fifth and an octave, slightly detuned, through a breathing low-pass.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.6;
    filter.connect(out);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.045;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const voices: [number, OscillatorType, number][] = [
      [55, 'sine', 0.16],
      [82.41, 'triangle', 0.05],
      [110.3, 'sine', 0.06],
      [164.8, 'sine', 0.025],
    ];
    for (const [freq, type, gain] of voices) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8;
      g.gain.value = gain;
      osc.connect(g).connect(filter);
      osc.start();
    }

    // Solar wind: filtered noise with a slow swell.
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 600;
    band.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    const swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.frequency.value = 0.07;
    swellGain.gain.value = 0.03;
    swell.connect(swellGain).connect(noiseGain.gain);
    swell.start();
    noise.connect(band).connect(noiseGain).connect(out);
    noise.start();
  }

  async setEnabled(on: boolean) {
    this.enabled = on;
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    if (on && !this.started) {
      this.started = true;
      this.startAmbience();
    }
    const now = ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(on ? 0.55 : 0, now + (on ? 2.5 : 0.6));
  }

  /** Crystalline ping for selections. */
  ping(pitch = 1) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (const [mult, gain] of [
      [1, 0.09],
      [2.01, 0.03],
    ] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880 * pitch * mult;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc.connect(g).connect(this.master);
      osc.start(now);
      osc.stop(now + 1.5);
    }
  }

  /** Soft airy sweep for section transitions. */
  whoosh() {
    if (!this.enabled || !this.ctx || !this.master || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.5);
    g.gain.linearRampToValueAtTime(0, now + 1.8);
    src.connect(filter).connect(g).connect(this.master);
    src.start(now);
    src.stop(now + 1.9);
  }
}

export const sound = new SoundEngine();

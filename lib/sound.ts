"use client";

import { config } from "@/config";

/**
 * Tiny sound engine. Everything is synthesised with Web Audio so the site works
 * with no audio files at all; config.musicSrc swaps the music box for a real track.
 */

type Note = [freq: number, beats: number];

// Happy Birthday (traditional, public domain), one octave up so it sounds like a music box.
const G4 = 392, A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const MELODY: Note[] = [
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
  [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
  [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 3],
];
const BEAT = 0.58;
const LOOP_GAP = 5;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private track: HTMLAudioElement | null = null;
  private loopTimer: number | null = null;
  private musicStarted = false;
  enabled = true;

  /** Must be called from a user gesture (the gate tap). */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? 1 : 0;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.5;
      this.musicBus.connect(this.master);
    }
    void this.ctx.resume();
    if (config.musicSrc && !this.track) {
      this.track = new Audio(config.musicSrc);
      this.track.loop = true;
      this.track.volume = 0.45;
      this.track.muted = !this.enabled;
      this.track.preload = "auto";
    }
  }

  startMusic() {
    if (this.musicStarted) return;
    this.musicStarted = true;
    if (this.track) {
      void this.track.play().catch(() => {});
      return;
    }
    this.playMelody();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.08);
    }
    if (this.track) {
      this.track.muted = !on;
      if (on && this.musicStarted && this.track.paused) void this.track.play().catch(() => {});
    }
  }

  private playMelody() {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    let t = ctx.currentTime + 0.4;
    for (const [freq, beats] of MELODY) {
      this.bell(freq, t, 0.075, this.musicBus);
      t += beats * BEAT;
    }
    const length = (t - ctx.currentTime + LOOP_GAP) * 1000;
    this.loopTimer = window.setTimeout(() => this.playMelody(), length);
  }

  private bell(freq: number, at: number, volume: number, out: AudioNode) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(volume, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 1.8);
    env.connect(out);
    for (const [mult, amp] of [[1, 1], [2, 0.35], [3.01, 0.12]] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      g.gain.value = amp;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + 1.9);
    }
  }

  private noise(duration: number) {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    return src;
  }

  /** Soft breath, for a candle going out. */
  puff(strength = 1) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const src = this.noise(0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(350, t + 0.4);
    filter.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22 * strength, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
  }

  /** Little pop for a confetti burst. */
  pop() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Rising sparkle for a wish coming true. */
  chime() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    [C5 * 2, E5 * 2, G5 * 2, C5 * 4].forEach((f, i) => this.bell(f, t + i * 0.09, 0.06, this.master!));
  }

  /** A soft whoosh used by the curtain. */
  whoosh() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const src = this.noise(1.2);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, t + 1.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
  }

  dispose() {
    if (this.loopTimer) window.clearTimeout(this.loopTimer);
  }
}

export const sound = new SoundEngine();

/**
 * Procedural Audio Engine for ULTRASTREAM.
 *
 * Singleton Web Audio API engine that generates all sounds procedurally
 * using oscillators, noise buffers, and filters. No external audio files
 * are required.
 *
 * Ambience types:
 *   - portal-hum:      Low droning oscillator with slow LFO modulation
 *   - warp-whoosh:      White noise through sweeping bandpass + rising oscillator
 *   - battle-ambient:   Tense low pulse with high-frequency shimmer
 *
 * SFX (one-shots):
 *   - enemy-hit:        Quick high-pitched blip (50ms)
 *   - enemy-destroy:    Descending sweep + noise burst (200ms)
 *   - wave-start:       Rising sweep with reverb-like tail (500ms)
 *   - game-over:        Low descending tone with slow fade (1s)
 *   - damage-taken:     Quick distorted buzz (100ms)
 *   - bloom-whoosh:     Breathy white noise sweep (800ms)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AmbienceType = 'portal-hum' | 'warp-whoosh' | 'battle-ambient';

export type SFXName =
  | 'enemy-hit'
  | 'enemy-destroy'
  | 'wave-start'
  | 'game-over'
  | 'damage-taken'
  | 'bloom-whoosh';

interface ActiveNode {
  source: AudioNode;
  gain: GainNode;
  /** Extra nodes that need to be stopped/disconnected on cleanup. */
  extras?: AudioNode[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ultrastream-audio-muted';
const DEFAULT_VOLUME = 0.6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a buffer filled with white noise (mono, 2 seconds).
 */
function createNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Reads the persisted mute preference from localStorage.
 */
function readMutePreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists the mute preference to localStorage.
 */
function writeMutePreference(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // Storage unavailable — silently ignore.
  }
}

// ---------------------------------------------------------------------------
// AudioEngine
// ---------------------------------------------------------------------------

class AudioEngine {
  private static instance: AudioEngine;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean;
  private volume: number = DEFAULT_VOLUME;
  private activeNodes: Map<string, ActiveNode> = new Map();
  private noiseBuffer: AudioBuffer | null = null;
  private musicSource: HTMLAudioElement | null = null;

  // -----------------------------------------------------------------------
  // Singleton
  // -----------------------------------------------------------------------

  private constructor() {
    this.isMuted = readMutePreference();
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // -----------------------------------------------------------------------
  // Context management
  // -----------------------------------------------------------------------

  /**
   * Lazily initialises the AudioContext. Safe to call multiple times.
   * Handles the browser requirement for user-gesture activation.
   */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }

    // Resume if suspended (autoplay policy).
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Swallow — will retry on next interaction.
      });
    }

    return this.ctx;
  }

  private getMasterGain(): GainNode {
    this.ensureContext();
    return this.masterGain!;
  }

  /**
   * Pre-generate the white noise buffer if needed.
   */
  private getNoiseBuffer(): AudioBuffer {
    const ctx = this.ensureContext();
    if (!this.noiseBuffer) {
      this.noiseBuffer = createNoiseBuffer(ctx);
    }
    return this.noiseBuffer;
  }

  // -----------------------------------------------------------------------
  // Ambience
  // -----------------------------------------------------------------------

  playAmbience(type: AmbienceType): void {
    // Avoid stacking the same ambience.
    if (this.activeNodes.has(type)) return;

    const ctx = this.ensureContext();
    const master = this.getMasterGain();

    switch (type) {
      case 'portal-hum':
        this.createPortalHum(ctx, master);
        break;
      case 'warp-whoosh':
        this.createWarpWhoosh(ctx, master);
        break;
      case 'battle-ambient':
        this.createBattleAmbient(ctx, master);
        break;
    }
  }

  stopAmbience(type: string, fadeMs = 300): void {
    const entry = this.activeNodes.get(type);
    if (!entry) return;

    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const fadeSec = fadeMs / 1000;

    entry.gain.gain.cancelScheduledValues(now);
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
    entry.gain.gain.linearRampToValueAtTime(0, now + fadeSec);

    // Clean up after fade.
    setTimeout(() => {
      this.disconnectEntry(type);
    }, fadeMs + 50);
  }

  stopAllAmbience(fadeMs = 300): void {
    for (const key of Array.from(this.activeNodes.keys())) {
      this.stopAmbience(key, fadeMs);
    }
  }

  // -----------------------------------------------------------------------
  // Music (MP3 playback)
  // -----------------------------------------------------------------------

  /**
   * Play background MP3 music. Loops continuously and respects mute state.
   * Volume is halved relative to master to allow SFX to cut through.
   */
  playMusic(): void {
    // Avoid stacking multiple music elements.
    if (this.musicSource) return;

    const audio = new Audio('/cyberpunk-theme.mp3');
    audio.loop = true;
    audio.volume = this.isMuted ? 0 : this.volume * 0.5;
    audio.play().catch(() => {
      // Autoplay policy blocked — will remain silent until user interaction.
    });
    this.musicSource = audio;
  }

  /**
   * Stop music with an optional fade-out.
   * @param fadeMs Duration of the fade in milliseconds (default 1000).
   */
  stopMusic(fadeMs = 1000): void {
    const audio = this.musicSource;
    if (!audio) return;

    if (fadeMs <= 0) {
      audio.pause();
      audio.currentTime = 0;
      this.musicSource = null;
      return;
    }

    const steps = 20;
    const interval = fadeMs / steps;
    const volumeStep = audio.volume / steps;
    const timer = setInterval(() => {
      const next = audio.volume - volumeStep;
      if (next <= 0) {
        clearInterval(timer);
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        if (this.musicSource === audio) {
          this.musicSource = null;
        }
      } else {
        audio.volume = next;
      }
    }, interval);
  }

  /**
   * Set the music volume directly (0-1). Clamped to valid range.
   */
  setMusicVolume(vol: number): void {
    if (this.musicSource) {
      this.musicSource.volume = Math.max(0, Math.min(1, vol));
    }
  }

  // -----------------------------------------------------------------------
  // SFX
  // -----------------------------------------------------------------------

  playSFX(name: SFXName): void {
    const ctx = this.ensureContext();
    const master = this.getMasterGain();

    switch (name) {
      case 'enemy-hit':
        this.sfxEnemyHit(ctx, master);
        break;
      case 'enemy-destroy':
        this.sfxEnemyDestroy(ctx, master);
        break;
      case 'wave-start':
        this.sfxWaveStart(ctx, master);
        break;
      case 'game-over':
        this.sfxGameOver(ctx, master);
        break;
      case 'damage-taken':
        this.sfxDamageTaken(ctx, master);
        break;
      case 'bloom-whoosh':
        this.sfxBloomWhoosh(ctx, master);
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Volume / Mute
  // -----------------------------------------------------------------------

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    writeMutePreference(muted);
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
    if (this.musicSource) {
      this.musicSource.volume = muted ? 0 : this.volume * 0.5;
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  /** Set master volume (0-1). Clamped to valid range. */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // -----------------------------------------------------------------------
  // Dispose
  // -----------------------------------------------------------------------

  dispose(): void {
    this.stopAllAmbience(0);
    this.stopMusic(0);

    // Force-disconnect everything remaining.
    for (const key of Array.from(this.activeNodes.keys())) {
      this.disconnectEntry(key);
    }

    if (this.ctx) {
      this.ctx.close().catch(() => {
        // Ignore close errors.
      });
      this.ctx = null;
      this.masterGain = null;
      this.noiseBuffer = null;
    }
  }

  // -----------------------------------------------------------------------
  // Private — Ambience Generators
  // -----------------------------------------------------------------------

  /**
   * Portal Hum: Deep droning oscillator with slow LFO modulation and filter sweep.
   */
  private createPortalHum(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Main droning oscillator.
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 55; // Low A

    // LFO for slow amplitude modulation.
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3; // Very slow wobble

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 15; // Modulation depth in Hz

    // Connect LFO to oscillator frequency.
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Low-pass filter with slow sweep.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 2;

    // Slow filter sweep — cycles between 150 and 400 Hz.
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.linearRampToValueAtTime(400, now + 8);
    filter.frequency.linearRampToValueAtTime(150, now + 16);
    // Schedule repeating sweep via a secondary LFO.
    const filterLfo = ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.value = 0.06; // ~16s cycle
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 125;
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    // Output gain.
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 2); // Fade in

    // Chain: osc -> filter -> gain -> master
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(now);
    lfo.start(now);
    filterLfo.start(now);

    this.activeNodes.set('portal-hum', {
      source: osc,
      gain,
      extras: [lfo, lfoGain, filter, filterLfo, filterLfoGain],
    });
  }

  /**
   * Warp Whoosh: White noise through bandpass with sweeping frequency,
   * layered with a rising oscillator. Hyperspace rushing sound.
   */
  private createWarpWhoosh(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // White noise source (looping buffer).
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getNoiseBuffer();
    noiseSource.loop = true;

    // Bandpass filter with sweeping center frequency.
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 1.5;

    // Sweep the bandpass center.
    const sweepLfo = ctx.createOscillator();
    sweepLfo.type = 'sine';
    sweepLfo.frequency.value = 0.15; // ~6.6s cycle
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 600;
    sweepLfo.connect(sweepGain);
    sweepGain.connect(bandpass.frequency);

    // Rising oscillator layer.
    const riseOsc = ctx.createOscillator();
    riseOsc.type = 'sine';
    riseOsc.frequency.value = 120;
    // Slow upward drift.
    riseOsc.frequency.linearRampToValueAtTime(240, now + 20);

    const riseGain = ctx.createGain();
    riseGain.gain.value = 0.08;

    // Output gain.
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 1.5); // Quick fade in

    // Chain: noise -> bandpass -> gain -> master
    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    // Rise osc also into gain.
    riseOsc.connect(riseGain);
    riseGain.connect(gain);
    gain.connect(master);

    noiseSource.start(now);
    sweepLfo.start(now);
    riseOsc.start(now);

    this.activeNodes.set('warp-whoosh', {
      source: noiseSource,
      gain,
      extras: [bandpass, sweepLfo, sweepGain, riseOsc, riseGain],
    });
  }

  /**
   * Battle Ambient: Tense low pulse with subtle high-frequency shimmer.
   */
  private createBattleAmbient(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Low pulse oscillator.
    const pulse = ctx.createOscillator();
    pulse.type = 'square';
    pulse.frequency.value = 40;

    // Pulse amplitude modulation for a rhythmic throb.
    const pulseLfo = ctx.createOscillator();
    pulseLfo.type = 'sine';
    pulseLfo.frequency.value = 1.5; // 1.5 Hz throb

    const pulseLfoGain = ctx.createGain();
    pulseLfoGain.gain.value = 0.1;
    pulseLfo.connect(pulseLfoGain);

    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0.15;
    pulseLfoGain.connect(pulseGain.gain);

    // Low-pass on pulse to tame the square wave.
    const pulseFilter = ctx.createBiquadFilter();
    pulseFilter.type = 'lowpass';
    pulseFilter.frequency.value = 120;
    pulseFilter.Q.value = 1;

    // High-frequency shimmer — quiet high oscillator with tremolo.
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 3200;

    const shimmerLfo = ctx.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 4;

    const shimmerLfoGain = ctx.createGain();
    shimmerLfoGain.gain.value = 0.02;
    shimmerLfo.connect(shimmerLfoGain);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.03;
    shimmerLfoGain.connect(shimmerGain.gain);

    // Output gain.
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 1.5);

    // Chain: pulse -> pulseFilter -> pulseGain -> gain -> master
    pulse.connect(pulseFilter);
    pulseFilter.connect(pulseGain);
    pulseGain.connect(gain);
    // Shimmer -> shimmerGain -> gain -> master
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gain);
    gain.connect(master);

    pulse.start(now);
    pulseLfo.start(now);
    shimmer.start(now);
    shimmerLfo.start(now);

    this.activeNodes.set('battle-ambient', {
      source: pulse,
      gain,
      extras: [
        pulseLfo,
        pulseLfoGain,
        pulseFilter,
        pulseGain,
        shimmer,
        shimmerLfo,
        shimmerLfoGain,
        shimmerGain,
      ],
    });
  }

  // -----------------------------------------------------------------------
  // Private — SFX Generators
  // -----------------------------------------------------------------------

  /**
   * Enemy Hit: Soft sci-fi "pew" — quick descending sine with gentle resonance.
   * Musical and satisfying, not shrill or beepy.
   */
  private sfxEnemyHit(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Primary tone — soft descending "pew"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

    // Sub-harmonic for warmth
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(260, now);
    sub.frequency.exponentialRampToValueAtTime(140, now + 0.1);

    // Low-pass to keep it smooth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.08, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    subGain.connect(master);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.15);
    sub.start(now);
    sub.stop(now + 0.13);
  }

  /**
   * Enemy Destroy: Satisfying cyberpunk "vaporize" — filtered sweep + soft crackle.
   * Feels like a digital disintegration, punchy but smooth.
   */
  private sfxEnemyDestroy(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Tonal sweep — sine through a resonant filter for a "zap" feel
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

    // Resonant low-pass for that cyberpunk "wub" tail
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    filter.Q.value = 5; // resonance peak for character

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Soft noise crackle — bandpass filtered so it's not harsh
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();

    const noiseBP = ctx.createBiquadFilter();
    noiseBP.type = 'bandpass';
    noiseBP.frequency.setValueAtTime(1200, now);
    noiseBP.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    noiseBP.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(master);

    noise.connect(noiseBP);
    noiseBP.connect(noiseGain);
    noiseGain.connect(master);

    osc.start(now);
    osc.stop(now + 0.35);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  /**
   * Wave Start: Epic cinematic "power up" — layered rising tones with filtered swell.
   * Feels like shields activating or a mech powering up. Musical fifth interval.
   */
  private sfxWaveStart(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Root tone — warm rising sine
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now); // C3
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.5); // up one octave

    // Fifth interval for epicness
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(195, now); // G3 (fifth of C3)
    osc2.frequency.exponentialRampToValueAtTime(390, now + 0.5);

    // Subtle high shimmer for sparkle
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(520, now);
    osc3.frequency.exponentialRampToValueAtTime(1040, now + 0.5);

    // Low-pass to keep it warm, opening as it rises
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.4);
    filter.Q.value = 1.5;

    // Swell envelope — builds up then gently fades
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.001, now);
    gain3.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc2.connect(gain2);
    gain2.connect(master);
    osc3.connect(gain3);
    gain3.connect(master);

    osc.start(now);
    osc.stop(now + 0.75);
    osc2.start(now);
    osc2.stop(now + 0.75);
    osc3.start(now);
    osc3.stop(now + 0.65);
  }

  /**
   * Game Over: Cinematic "power down" — descending minor chord with filtered decay.
   * Dramatic and moody, not grating. Think movie score stinger.
   */
  private sfxGameOver(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Root — descending sine (warm, not harsh)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(55, now + 1.5); // slow descent to A1

    // Minor third for sadness (C4)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(261, now);
    osc2.frequency.exponentialRampToValueAtTime(65, now + 1.5);

    // Fifth for depth (E4)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(330, now);
    osc3.frequency.exponentialRampToValueAtTime(82, now + 1.2);

    // Warm low-pass that closes as tones descend
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 1.5);
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.8);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.linearRampToValueAtTime(0, now + 1.3);

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.08, now);
    gain3.gain.linearRampToValueAtTime(0, now + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc2.connect(gain2);
    gain2.connect(master);
    osc3.connect(gain3);
    gain3.connect(master);

    osc.start(now);
    osc.stop(now + 1.6);
    osc2.start(now);
    osc2.stop(now + 1.4);
    osc3.start(now);
    osc3.stop(now + 1.2);
  }

  /**
   * Damage Taken: Short bass "thud" with filtered noise — feels like a shield impact.
   * Punchy and physical, not buzzy or grating.
   */
  private sfxDamageTaken(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    // Low bass thud — sine for clean sub impact
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    // Short filtered noise for "crack" texture
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();

    const noiseLPF = ctx.createBiquadFilter();
    noiseLPF.type = 'lowpass';
    noiseLPF.frequency.value = 600; // keep it low and thumpy
    noiseLPF.Q.value = 1;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(master);
    noise.connect(noiseLPF);
    noiseLPF.connect(noiseGain);
    noiseGain.connect(master);

    osc.start(now);
    osc.stop(now + 0.18);
    noise.start(now);
    noise.stop(now + 0.1);
  }

  /**
   * Bloom Whoosh: Breathy white noise sweep through bandpass,
   * rising then falling (800ms).
   */
  private sfxBloomWhoosh(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 2;
    // Sweep: low -> high -> low.
    bandpass.frequency.setValueAtTime(300, now);
    bandpass.frequency.exponentialRampToValueAtTime(4000, now + 0.35);
    bandpass.frequency.exponentialRampToValueAtTime(200, now + 0.8);

    const gain = ctx.createGain();
    // Swell up then fade — gentle, cinematic.
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(master);

    noise.start(now);
    noise.stop(now + 0.85);
  }

  // -----------------------------------------------------------------------
  // Private — Cleanup
  // -----------------------------------------------------------------------

  private disconnectEntry(key: string): void {
    const entry = this.activeNodes.get(key);
    if (!entry) return;

    try {
      // Stop the source if it supports stop().
      if ('stop' in entry.source && typeof (entry.source as OscillatorNode).stop === 'function') {
        (entry.source as OscillatorNode).stop();
      }
    } catch {
      // Already stopped — ignore.
    }

    try {
      entry.source.disconnect();
    } catch {
      // Already disconnected.
    }

    try {
      entry.gain.disconnect();
    } catch {
      // Already disconnected.
    }

    // Clean up extras.
    if (entry.extras) {
      for (const node of entry.extras) {
        try {
          if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
            (node as OscillatorNode).stop();
          }
        } catch {
          // Already stopped.
        }
        try {
          node.disconnect();
        } catch {
          // Already disconnected.
        }
      }
    }

    this.activeNodes.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const audioEngine =
  typeof window !== 'undefined' ? AudioEngine.getInstance() : (null as unknown as AudioEngine);

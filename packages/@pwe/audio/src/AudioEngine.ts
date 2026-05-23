/**
 * AudioEngine wraps the Web Audio API to provide a simple,
 * game-oriented audio playback system.
 *
 * Features:
 * - Master volume + per-sound volume
 * - Playback of one-shot SFX and looping music
 * - 2D positional audio (panning based on x/y offset)
 * - Mute / unmute
 */

export interface AudioEngineConfig {
  masterVolume?: number;
}

export interface PlayOptions {
  volume?: number;
  loop?: boolean;
  pan?: number; // -1 (left) to 1 (right)
  playbackRate?: number;
}

export class AudioEngine {
  private _ctx: AudioContext | null = null;
  private _masterGain: GainNode | null = null;
  private _sounds = new Map<string, AudioBuffer>();
  private _activeSources = new Set<AudioBufferSourceNode>();
  private _masterVolume = 1;
  private _muted = false;

  constructor(config: AudioEngineConfig = {}) {
    this._masterVolume = config.masterVolume ?? 1;
  }

  /** Lazily create AudioContext on first use (browsers require user gesture). */
  private _ensureContext(): AudioContext {
    if (!this._ctx) {
      this._ctx = new AudioContext();
      this._masterGain = this._ctx.createGain();
      this._masterGain.connect(this._ctx.destination);
      this._updateMasterGain();
    }
    return this._ctx;
  }

  /** Decode and store an AudioBuffer under a key. */
  async load(key: string, url: string): Promise<void> {
    const ctx = this._ensureContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this._sounds.set(key, audioBuffer);
  }

  /** Store a pre-loaded AudioBuffer. */
  registerBuffer(key: string, buffer: AudioBuffer): void {
    this._sounds.set(key, buffer);
  }

  /** Play a one-shot sound effect. Returns the source node so it can be stopped. */
  play(key: string, options: PlayOptions = {}): AudioBufferSourceNode | null {
    const buffer = this._sounds.get(key);
    if (!buffer) {
      // eslint-disable-next-line no-console
      console.warn(`AudioEngine: sound "${key}" not found`);
      return null;
    }

    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = options.volume ?? 1;

    const panner = ctx.createStereoPanner();
    panner.pan.value = options.pan ?? 0;

    source.connect(gain);
    gain.connect(panner);
    panner.connect(this._masterGain!);

    source.loop = options.loop ?? false;
    source.playbackRate.value = options.playbackRate ?? 1;

    source.onended = () => {
      this._activeSources.delete(source);
    };

    this._activeSources.add(source);
    source.start(0);
    return source;
  }

  /** Play a sound with 2D positional panning. */
  playAt(key: string, x: number, y: number, options: PlayOptions = {}): AudioBufferSourceNode | null {
    // Simple linear panning based on x position, attenuated by distance
    const pan = Math.max(-1, Math.min(1, x));
    const distance = Math.sqrt(x * x + y * y);
    const volume = Math.max(0, 1 - distance / 100) * (options.volume ?? 1);
    return this.play(key, { ...options, pan, volume });
  }

  /** Stop all active sounds. */
  stopAll(): void {
    for (const source of this._activeSources) {
      try {
        source.stop();
      } catch {
        // ignore already-stopped sources
      }
    }
    this._activeSources.clear();
  }

  /** Set master volume (0-1). */
  setMasterVolume(value: number): void {
    this._masterVolume = Math.max(0, Math.min(1, value));
    this._updateMasterGain();
  }

  get masterVolume(): number {
    return this._masterVolume;
  }

  /** Mute / unmute all audio. */
  setMuted(muted: boolean): void {
    this._muted = muted;
    this._updateMasterGain();
  }

  get muted(): boolean {
    return this._muted;
  }

  /** Resume AudioContext (browsers suspend it until user interaction). */
  resume(): Promise<void> {
    const ctx = this._ensureContext();
    if (ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  /** Suspend AudioContext. */
  suspend(): Promise<void> {
    if (this._ctx) {
      return this._ctx.suspend();
    }
    return Promise.resolve();
  }

  /** Release all buffers and close context. */
  destroy(): void {
    this.stopAll();
    this._sounds.clear();
    if (this._ctx) {
      void this._ctx.close();
      this._ctx = null;
      this._masterGain = null;
    }
  }

  private _updateMasterGain(): void {
    if (this._masterGain) {
      this._masterGain.gain.value = this._muted ? 0 : this._masterVolume;
    }
  }
}

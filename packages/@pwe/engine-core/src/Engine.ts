import { World } from '@pwe/ecs-core';
import { SignalBus } from '@pwe/signalbus';
import { SceneSerializer } from '@pwe/serialize';
import { InputManager } from './InputManager.js';

export type EngineMode = 'play' | 'edit';

export interface EngineConfig {
  targetFps?: number;
  autoStart?: boolean;
}

export class Engine {
  readonly world = new World();
  readonly signalBus = new SignalBus();
  readonly serializer = new SceneSerializer();
  readonly input = new InputManager();

  private _mode: EngineMode = 'edit';
  private _running = false;
  private _rafId = 0;
  private _lastTime = 0;
  private _config: Required<EngineConfig>;

  private _onUpdate: ((dt: number) => void) | undefined;
  private _onRender: ((dt: number) => void) | undefined;

  constructor(config: EngineConfig = {}) {
    this._config = {
      targetFps: config.targetFps ?? 60,
      autoStart: config.autoStart ?? false,
    };

    if (this._config.autoStart) {
      this.play();
    }
  }

  get mode(): EngineMode {
    return this._mode;
  }

  get isPlaying(): boolean {
    return this._mode === 'play' && this._running;
  }

  set onUpdate(fn: ((dt: number) => void) | undefined) {
    this._onUpdate = fn;
  }

  set onRender(fn: ((dt: number) => void) | undefined) {
    this._onRender = fn;
  }

  play(): void {
    if (this._mode === 'play' && this._running) return;
    this._mode = 'play';
    this._running = true;
    this._lastTime = performance.now();
    this.signalBus.emit('engine:play', undefined);
    this._scheduleFrame();
  }

  pause(): void {
    if (!this._running) return;
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    this.signalBus.emit('engine:pause', undefined);
  }

  stop(): void {
    this.pause();
    this._mode = 'edit';
    this.signalBus.emit('engine:stop', undefined);
  }

  step(dt: number): void {
    if (!this._running) return;
    this._tick(dt);
  }

  private _scheduleFrame = (): void => {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._onFrame);
  };

  private _onFrame = (time: number): void => {
    if (!this._running) return;

    const rawDt = time - this._lastTime;
    this._lastTime = time;

    // Clamp delta to avoid spiral of death on tab switch / lag
    const dt = Math.min(rawDt, 1000 / 10);

    this._tick(dt);
    this._scheduleFrame();
  };

  private _tick(dt: number): void {
    this.input.resetFrame();
    this.world.update(dt);
    this._onUpdate?.(dt);
    this._onRender?.(dt);
  }

  destroy(): void {
    this.pause();
    this.input.detach();
    this.signalBus.clear();
    this.world.clear();
  }
}

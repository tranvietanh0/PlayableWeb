import type { ScriptContext } from './types.js';
import type { Entity } from '@pwe/ecs-core';

/**
 * A mounted script instance on a specific entity.
 * Wraps the user object and routes lifecycle callbacks.
 */
export class ScriptInstance {
  readonly entity: Entity;
  readonly scriptName: string;
  readonly target: object;
  readonly context: ScriptContext;

  private _started = false;
  private _destroyed = false;

  constructor(entity: Entity, scriptName: string, target: object, context: ScriptContext) {
    this.entity = entity;
    this.scriptName = scriptName;
    this.target = target;
    this.context = context;
  }

  start(): void {
    if (this._started || this._destroyed) return;
    this._started = true;
    const fn = (this.target as Record<string, unknown>).onStart;
    if (typeof fn === 'function') {
      try {
        (fn as () => void).call(this.target);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Script ${this.scriptName} onStart error:`, err);
      }
    }
  }

  update(deltaTime: number): void {
    if (!this._started || this._destroyed) return;
    const fn = (this.target as Record<string, unknown>).onUpdate;
    if (typeof fn === 'function') {
      try {
        (fn as (dt: number) => void).call(this.target, deltaTime);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Script ${this.scriptName} onUpdate error:`, err);
      }
    }
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    const fn = (this.target as Record<string, unknown>).onDestroy;
    if (typeof fn === 'function') {
      try {
        (fn as () => void).call(this.target);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Script ${this.scriptName} onDestroy error:`, err);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this._started || this._destroyed) return;
    const fn = (this.target as Record<string, unknown>)[event];
    if (typeof fn === 'function') {
      try {
        (fn as (...a: unknown[]) => void).call(this.target, ...args);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Script ${this.scriptName} ${event} error:`, err);
      }
    }
  }

  get started(): boolean {
    return this._started;
  }

  get destroyed(): boolean {
    return this._destroyed;
  }
}

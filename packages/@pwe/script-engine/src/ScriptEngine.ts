import type { World, Entity } from '@pwe/ecs-core';
import { SignalBus } from '@pwe/signalbus';
import type { AssetManager } from '@pwe/asset-manager';
import { ScriptInstance } from './ScriptInstance.js';
import type { ScriptContext, ScriptModule, CompiledScript } from './types.js';

export interface ScriptEngineConfig {
  world: World;
  signalBus: SignalBus;
  assetManager: AssetManager;
  sandboxGlobals?: Record<string, unknown>;
}

/**
 * ScriptEngine compiles user TypeScript/JavaScript and mounts it as
 * ScriptInstance objects on entities.
 *
 * In a real implementation, TS compilation happens in a Web Worker
 * using the TypeScript compiler API or esbuild-wasm. Here we provide
 * the architecture and a synchronous JS fallback for testing.
 */
export class ScriptEngine {
  readonly world: World;
  readonly signalBus: SignalBus;
  readonly assetManager: AssetManager;

  private _sandboxGlobals: Record<string, unknown>;
  private _compiled = new Map<string, CompiledScript>();
  private _instances = new Map<Entity, ScriptInstance[]>();

  constructor(config: ScriptEngineConfig) {
    this.world = config.world;
    this.signalBus = config.signalBus;
    this.assetManager = config.assetManager;
    this._sandboxGlobals = {
      console: {
        log: (...args: unknown[]) => {
          // eslint-disable-next-line no-console
          console.log('[Script]', ...args);
        },
        warn: (...args: unknown[]) => {
          // eslint-disable-next-line no-console
          console.warn('[Script]', ...args);
        },
        error: (...args: unknown[]) => {
          // eslint-disable-next-line no-console
          console.error('[Script]', ...args);
        },
      },
      Math,
      setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
      clearTimeout: (id: number) => clearTimeout(id),
      ...config.sandboxGlobals,
    };
  }

  /**
   * Compile a TypeScript source string into an executable module.
   * In production this would delegate to a Web Worker.
   */
  compile(source: string, name = 'anonymous'): CompiledScript {
    const key = `${name}:${this._hash(source)}`;
    if (this._compiled.has(key)) {
      return this._compiled.get(key)!;
    }

    // Synchronous JS fallback: wrap source in a factory function.
    // We strip TypeScript type annotations with a naive regex for the fallback.
    const js = this._stripTypes(source);
    const factory = new Function(
      'exports',
      'require',
      'module',
      '__dirname',
      '__filename',
      `"use strict";\n${js}`
    );

    const compiled: CompiledScript = {
      name,
      source,
      factory: (ctx: ScriptContext) => {
        const mod: ScriptModule = { exports: {} };
        const sandboxRequire = (id: string) => {
          if (id === '@pwe/engine-core') return ctx;
          throw new Error(`Module not found: ${id}`);
        };
        factory(mod.exports, sandboxRequire, mod, '', name);
        const ctor = (mod.exports as Record<string, unknown>).default ?? mod.exports;
        if (typeof ctor !== 'function') {
          throw new Error(`Script ${name} does not export a default class`);
        }
        return ctor as new (ctx: ScriptContext) => object;
      },
    };

    this._compiled.set(key, compiled);
    return compiled;
  }

  /**
   * Instantiate a compiled script on an entity.
   */
  instantiate(entity: Entity, compiled: CompiledScript): ScriptInstance {
    const ctx = this._createContext(entity);
    const Ctor = compiled.factory(ctx);
    const obj = new Ctor(ctx);
    const instance = new ScriptInstance(entity, compiled.name, obj, ctx);

    let list = this._instances.get(entity);
    if (!list) {
      list = [];
      this._instances.set(entity, list);
    }
    list.push(instance);
    return instance;
  }

  /**
   * Remove all script instances for an entity.
   */
  removeAll(entity: Entity): void {
    const list = this._instances.get(entity);
    if (!list) return;
    for (const instance of list) {
      instance.destroy();
    }
    this._instances.delete(entity);
  }

  /**
   * Call onStart on all instances for an entity.
   */
  startEntity(entity: Entity): void {
    const list = this._instances.get(entity);
    if (!list) return;
    for (const instance of list) {
      instance.start();
    }
  }

  /**
   * Call onUpdate on all instances for an entity.
   */
  updateEntity(entity: Entity, deltaTime: number): void {
    const list = this._instances.get(entity);
    if (!list) return;
    for (const instance of list) {
      instance.update(deltaTime);
    }
  }

  /**
   * Call a custom event handler (e.g. onCollisionEnter) on all instances.
   */
  emit(entity: Entity, event: string, ...args: unknown[]): void {
    const list = this._instances.get(entity);
    if (!list) return;
    for (const instance of list) {
      instance.emit(event, ...args);
    }
  }

  getInstances(entity: Entity): readonly ScriptInstance[] {
    return this._instances.get(entity) ?? [];
  }

  clear(): void {
    for (const list of this._instances.values()) {
      for (const instance of list) {
        instance.destroy();
      }
    }
    this._instances.clear();
    this._compiled.clear();
  }

  private _createContext(entity: Entity): ScriptContext {
    return {
      entity,
      world: this.world,
      signalBus: this.signalBus,
      assetManager: this.assetManager,
      globals: this._sandboxGlobals,
    };
  }

  private _stripTypes(ts: string): string {
    // Naive TypeScript strip for fallback compilation.
    // In production this is replaced by a real TS compiler.
    return ts
      .replace(/:\s*[A-Za-z0-9_<>[\]|&{}\s]+(?=[,;=)])/g, '')
      .replace(/\b(interface|type)\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/\bexport\s+default\s+class\s+(\w+)/g, 'exports.default = class $1')
      .replace(/\bexport\s+class\s+(\w+)/g, 'exports.$1 = class $1')
      .replace(/\bexport\s+\{[^}]*\}\s*;?/g, '')
      .replace(/\bimport\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/\breadonly\s+/g, '')
      .replace(/\bprivate\s+/g, '')
      .replace(/\bprotected\s+/g, '')
      .replace(/\bpublic\s+/g, '')
      .replace(/\?\s*:/g, ':')
      .replace(/\s+as\s+\w+/g, '');
  }

  private _hash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h.toString(36);
  }
}

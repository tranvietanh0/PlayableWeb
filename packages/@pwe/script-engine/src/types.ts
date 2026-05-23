import type { World, Entity } from '@pwe/ecs-core';
import type { SignalBus } from '@pwe/signalbus';
import type { AssetManager } from '@pwe/asset-manager';

/** Property decorator metadata for exposed script fields. */
export interface PropertyMetadata {
  type: 'number' | 'string' | 'boolean' | 'vec2' | 'vec3' | 'color' | 'asset';
  default?: unknown;
  min?: number;
  max?: number;
  tooltip?: string;
}

/** Context injected into every script instance. */
export interface ScriptContext {
  readonly entity: Entity;
  readonly world: World;
  readonly signalBus: SignalBus;
  readonly assetManager: AssetManager;
  readonly globals: Record<string, unknown>;
}

/** Compiled script ready for instantiation. */
export interface CompiledScript {
  readonly name: string;
  readonly source: string;
  readonly factory: (ctx: ScriptContext) => new (ctx: ScriptContext) => object;
}

/** Module shape used during script evaluation. */
export interface ScriptModule {
  exports: object;
}

import { System, type World, type Entity } from '@pwe/ecs-core';
import { SignalBus } from '@pwe/signalbus';
import type { AssetManager } from '@pwe/asset-manager';
import { ScriptEngine } from './ScriptEngine.js';
import { Script } from './Script.js';

export interface ScriptSystemConfig {
  assetManager: AssetManager;
  signalBus: SignalBus;
}

/**
 * ECS System that drives Script lifecycle.
 * - On entity add with Script component: compile + instantiate
 * - On update: call onUpdate
 * - On entity remove: call onDestroy + remove instances
 */
export class ScriptSystem extends System {
  readonly engine: ScriptEngine;
  private _pendingStart = new Set<Entity>();

  constructor(config: ScriptSystemConfig) {
    super({
      name: 'ScriptSystem',
      priority: 100,
      update: (world: World, dt: number) => {
        this._update(world, dt);
      },
    });

    this.engine = new ScriptEngine({
      world: null as unknown as World,
      signalBus: config.signalBus,
      assetManager: config.assetManager,
    });

    // Listen for collision events and forward to scripts
    config.signalBus.subscribe('collision:enter', (payload: { entityA: Entity; entityB: Entity }) => {
      this.engine.emit(payload.entityA, 'onCollisionEnter', payload.entityB);
      this.engine.emit(payload.entityB, 'onCollisionEnter', payload.entityA);
    });

    config.signalBus.subscribe('collision:exit', (payload: { entityA: Entity; entityB: Entity }) => {
      this.engine.emit(payload.entityA, 'onCollisionExit', payload.entityB);
      this.engine.emit(payload.entityB, 'onCollisionExit', payload.entityA);
    });
  }

  private _update(world: World, dt: number): void {
    // Lazily bind world on first update
    if (this.engine.world !== world) {
      (this.engine as { world: World }).world = world;
    }

    const entities = world.getEntitiesWith(Script);
    for (const entity of entities) {
      const script = world.getComponent(entity, Script);
      if (!script) continue;

      const instances = this.engine.getInstances(entity);
      if (instances.length === 0 && script.source) {
        try {
          const compiled = this.engine.compile(script.source, script.scriptName);
          this.engine.instantiate(entity, compiled);
          this._pendingStart.add(entity);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Failed to compile script ${script.scriptName}:`, err);
        }
      }

      if (this._pendingStart.has(entity)) {
        this.engine.startEntity(entity);
        this._pendingStart.delete(entity);
      }

      this.engine.updateEntity(entity, dt);
    }

    // Clean up instances for destroyed entities
    for (const entity of this.engine['_instances'].keys()) {
      if (!world.isAlive(entity)) {
        this.engine.removeAll(entity);
      }
    }
  }

  destroy(): void {
    this.engine.clear();
  }
}

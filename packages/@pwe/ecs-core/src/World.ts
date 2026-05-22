import { EntityManager } from './EntityManager.js';
import { ComponentStorage } from './ComponentStorage.js';
import { Query } from './Query.js';
import { System } from './System.js';
import type { Entity, ComponentType, SystemUpdateFn } from './types.js';

export class World {
  readonly entityManager = new EntityManager();
  readonly components = new ComponentStorage();
  private _systems: System[] = [];
  private _running = false;
  private _time = 0;

  createEntity(): Entity {
    return this.entityManager.create();
  }

  destroyEntity(entity: Entity): boolean {
    if (!this.entityManager.isAlive(entity)) return false;
    this.components.removeAll(entity);
    return this.entityManager.destroy(entity);
  }

  isAlive(entity: Entity): boolean {
    return this.entityManager.isAlive(entity);
  }

  addComponent<T extends object>(entity: Entity, component: T): void {
    if (!this.entityManager.isAlive(entity)) {
      throw new Error(`Cannot add component to dead entity ${entity}`);
    }
    this.components.set(entity, component);
  }

  getComponent<T extends object>(entity: Entity, ctor: ComponentType<T>): T | undefined {
    return this.components.get(entity, ctor);
  }

  hasComponent(entity: Entity, ctor: ComponentType): boolean {
    return this.components.has(entity, ctor);
  }

  removeComponent(entity: Entity, ctor: ComponentType): boolean {
    return this.components.remove(entity, ctor);
  }

  getEntitiesWith(ctor: ComponentType): Entity[] {
    return this.components.getEntitiesWith(ctor);
  }

  createQuery(config: { with: ComponentType[]; without?: ComponentType[] }): Query {
    return new Query(this, config);
  }

  addSystem(config: SystemConfig | System): void {
    const system = config instanceof System ? config : new System(config);
    this._systems.push(system);
    this._systems.sort((a, b) => a.priority - b.priority);
  }

  removeSystem(name: string): boolean {
    const idx = this._systems.findIndex((s) => s.name === name);
    if (idx === -1) return false;
    this._systems.splice(idx, 1);
    return true;
  }

  getSystem(name: string): System | undefined {
    return this._systems.find((s) => s.name === name);
  }

  update(deltaTime: number): void {
    this._time += deltaTime;
    for (const system of this._systems) {
      system.update(this, deltaTime);
    }
  }

  get time(): number {
    return this._time;
  }

  get running(): boolean {
    return this._running;
  }

  clear(): void {
    this._systems = [];
    this._time = 0;
    this._running = false;
    this.components.clear();
    this.entityManager.clear();
  }
}

// Re-export for inline use
export interface SystemConfig {
  name: string;
  update: SystemUpdateFn;
  priority?: number;
}

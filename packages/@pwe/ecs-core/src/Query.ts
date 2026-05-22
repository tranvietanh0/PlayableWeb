import type { Entity, ComponentType } from './types.js';
import type { World } from './World.js';

export interface QueryConfig {
  with: ComponentType[];
  without?: ComponentType[];
}

export class Query {
  private _with: ComponentType[];
  private _without: ComponentType[];
  private _world: World;

  constructor(world: World, config: QueryConfig) {
    this._world = world;
    this._with = [...config.with];
    this._without = config.without ? [...config.without] : [];
  }

  get entities(): Entity[] {
    if (this._with.length === 0) return [];

    // Start with the smallest component set for efficiency
    let candidates = this._world.getEntitiesWith(this._with[0]!);

    for (let i = 1; i < this._with.length; i++) {
      const nextSet = this._world.getEntitiesWith(this._with[i]!);
      candidates = candidates.filter((e) => nextSet.includes(e));
      if (candidates.length === 0) return [];
    }

    if (this._without.length > 0) {
      candidates = candidates.filter((e) => {
        return this._without.every((ctor) => !this._world.hasComponent(e, ctor));
      });
    }

    return candidates;
  }

  forEach(fn: (entity: Entity) => void): void {
    for (const entity of this.entities) {
      fn(entity);
    }
  }

  first(): Entity | undefined {
    return this.entities[0];
  }

  count(): number {
    return this.entities.length;
  }
}

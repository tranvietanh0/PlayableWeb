import type { Entity, ComponentType } from './types.js';

let _nextComponentTypeId = 0;
const _componentTypeToId = new WeakMap<object, number>();

export function getComponentTypeId(ctor: ComponentType): number {
  if (!_componentTypeToId.has(ctor)) {
    _componentTypeToId.set(ctor, _nextComponentTypeId++);
  }
  return _componentTypeToId.get(ctor)!;
}

export class ComponentStorage {
  private _storage = new Map<number, Map<Entity, object>>();

  set<T extends object>(entity: Entity, component: T): void {
    const typeId = getComponentTypeId(component.constructor as ComponentType);
    let map = this._storage.get(typeId);
    if (!map) {
      map = new Map<Entity, object>();
      this._storage.set(typeId, map);
    }
    map.set(entity, component);
  }

  get<T extends object>(entity: Entity, ctor: ComponentType<T>): T | undefined {
    const typeId = getComponentTypeId(ctor);
    const map = this._storage.get(typeId);
    return map?.get(entity) as T | undefined;
  }

  has(entity: Entity, ctor: ComponentType): boolean {
    const typeId = getComponentTypeId(ctor);
    const map = this._storage.get(typeId);
    return map?.has(entity) ?? false;
  }

  remove(entity: Entity, ctor: ComponentType): boolean {
    const typeId = getComponentTypeId(ctor);
    const map = this._storage.get(typeId);
    if (!map) return false;
    return map.delete(entity);
  }

  removeAll(entity: Entity): void {
    for (const map of this._storage.values()) {
      map.delete(entity);
    }
  }

  getEntitiesWith(ctor: ComponentType): Entity[] {
    const typeId = getComponentTypeId(ctor);
    const map = this._storage.get(typeId);
    if (!map) return [];
    return Array.from(map.keys());
  }

  getComponentMap<T extends object>(ctor: ComponentType<T>): ReadonlyMap<Entity, T> | undefined {
    const typeId = getComponentTypeId(ctor);
    const map = this._storage.get(typeId);
    return map as ReadonlyMap<Entity, T> | undefined;
  }

  clear(): void {
    this._storage.clear();
  }
}

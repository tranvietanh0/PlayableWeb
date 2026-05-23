import type { Entity } from './types.js';

const ENTITY_INDEX_BITS = 20;
const ENTITY_INDEX_MASK = (1 << ENTITY_INDEX_BITS) - 1;
const ENTITY_GENERATION_MASK = 0xfff;

export class EntityManager {
  private _nextIndex = 0;
  private _freeList: number[] = [];
  private _generations: Uint16Array = new Uint16Array(1024);
  private _alive = new Set<number>();

  get aliveCount(): number {
    return this._alive.size;
  }

  get isEmpty(): boolean {
    return this._alive.size === 0;
  }

  create(): Entity {
    let index: number;
    let generation: number;

    if (this._freeList.length > 0) {
      index = this._freeList.pop()!;
      generation = this._generations[index]!;
    } else {
      index = this._nextIndex++;
      generation = 0;
      this._ensureCapacity(index);
    }

    this._alive.add(index);
    return (index & ENTITY_INDEX_MASK) | ((generation & ENTITY_GENERATION_MASK) << ENTITY_INDEX_BITS);
  }

  destroy(entity: Entity): boolean {
    const index = entity & ENTITY_INDEX_MASK;
    const generation = (entity >>> ENTITY_INDEX_BITS) & ENTITY_GENERATION_MASK;

    if (!this.isAlive(entity)) return false;

    this._alive.delete(index);
    this._generations[index] = ((generation + 1) & ENTITY_GENERATION_MASK) as unknown as number;
    this._freeList.push(index);
    return true;
  }

  isAlive(entity: Entity): boolean {
    const index = entity & ENTITY_INDEX_MASK;
    const generation = (entity >>> ENTITY_INDEX_BITS) & ENTITY_GENERATION_MASK;

    if (!this._alive.has(index)) return false;
    return this._generations[index] === generation;
  }

  getAllEntities(): Entity[] {
    return this.getAllAlive();
  }

  getAllAlive(): Entity[] {
    const result: Entity[] = [];
    for (const index of this._alive) {
      result.push((index & ENTITY_INDEX_MASK) | ((this._generations[index]! & ENTITY_GENERATION_MASK) << ENTITY_INDEX_BITS));
    }
    return result;
  }

  clear(): void {
    this._alive.clear();
    this._freeList.length = 0;
    this._nextIndex = 0;
    this._generations.fill(0);
  }

  private _ensureCapacity(index: number): void {
    if (index >= this._generations.length) {
      const newArray = new Uint16Array(this._generations.length * 2);
      newArray.set(this._generations);
      this._generations = newArray;
    }
  }
}

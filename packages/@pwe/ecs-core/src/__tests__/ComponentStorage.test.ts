import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentStorage, getComponentTypeId } from '../ComponentStorage.js';

class Position {
  constructor(public x = 0, public y = 0) {}
}

class Velocity {
  constructor(public vx = 0, public vy = 0) {}
}

describe('ComponentStorage', () => {
  let storage: ComponentStorage;

  beforeEach(() => {
    storage = new ComponentStorage();
  });

  it('should set and get a component', () => {
    const entity = 1;
    const pos = new Position(10, 20);
    storage.set(entity, pos);
    expect(storage.get(entity, Position)).toBe(pos);
  });

  it('should return undefined for missing component', () => {
    expect(storage.get(999, Position)).toBeUndefined();
  });

  it('should check has correctly', () => {
    const entity = 1;
    storage.set(entity, new Position());
    expect(storage.has(entity, Position)).toBe(true);
    expect(storage.has(entity, Velocity)).toBe(false);
  });

  it('should remove a component', () => {
    const entity = 1;
    storage.set(entity, new Position());
    expect(storage.remove(entity, Position)).toBe(true);
    expect(storage.get(entity, Position)).toBeUndefined();
    expect(storage.remove(entity, Position)).toBe(false);
  });

  it('should remove all components for an entity', () => {
    const entity = 1;
    storage.set(entity, new Position());
    storage.set(entity, new Velocity());
    storage.removeAll(entity);
    expect(storage.get(entity, Position)).toBeUndefined();
    expect(storage.get(entity, Velocity)).toBeUndefined();
  });

  it('should get entities with a component type', () => {
    storage.set(1, new Position());
    storage.set(2, new Position());
    storage.set(3, new Velocity());
    const entities = storage.getEntitiesWith(Position);
    expect(entities).toContain(1);
    expect(entities).toContain(2);
    expect(entities).not.toContain(3);
  });

  it('should get component map', () => {
    const pos = new Position(5, 5);
    storage.set(1, pos);
    const map = storage.getComponentMap(Position);
    expect(map).toBeDefined();
    expect(map!.get(1)).toBe(pos);
  });

  it('should clear all storage', () => {
    storage.set(1, new Position());
    storage.set(2, new Velocity());
    storage.clear();
    expect(storage.get(1, Position)).toBeUndefined();
    expect(storage.get(2, Velocity)).toBeUndefined();
  });
});

describe('getComponentTypeId', () => {
  it('should assign unique IDs to different types', () => {
    const id1 = getComponentTypeId(Position);
    const id2 = getComponentTypeId(Velocity);
    expect(id1).not.toBe(id2);
  });

  it('should return same ID for same type', () => {
    const id1 = getComponentTypeId(Position);
    const id2 = getComponentTypeId(Position);
    expect(id1).toBe(id2);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../World.js';

class Position {
  constructor(public x = 0, public y = 0) {}
}

class Velocity {
  constructor(public vx = 0, public vy = 0) {}
}

class Health {
  constructor(public hp = 100) {}
}

describe('Query', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  it('should query entities with a single component', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    world.createEntity();
    world.addComponent(e1, new Position());
    world.addComponent(e2, new Position());

    const query = world.createQuery({ with: [Position] });
    expect(query.count()).toBe(2);
    expect(query.entities).toContain(e1);
    expect(query.entities).toContain(e2);
  });

  it('should query entities with multiple components', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    const e3 = world.createEntity();

    world.addComponent(e1, new Position());
    world.addComponent(e1, new Velocity());

    world.addComponent(e2, new Position());
    world.addComponent(e2, new Velocity());

    world.addComponent(e3, new Position());

    const query = world.createQuery({ with: [Position, Velocity] });
    expect(query.count()).toBe(2);
    expect(query.entities).toContain(e1);
    expect(query.entities).toContain(e2);
    expect(query.entities).not.toContain(e3);
  });

  it('should exclude entities with "without" components', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();

    world.addComponent(e1, new Position());
    world.addComponent(e1, new Velocity());

    world.addComponent(e2, new Position());

    const query = world.createQuery({ with: [Position], without: [Velocity] });
    expect(query.count()).toBe(1);
    expect(query.entities).toContain(e2);
    expect(query.entities).not.toContain(e1);
  });

  it('should return empty for no matches', () => {
    const query = world.createQuery({ with: [Position] });
    expect(query.count()).toBe(0);
    expect(query.entities).toEqual([]);
  });

  it('should return empty for empty with array', () => {
    const query = world.createQuery({ with: [] });
    expect(query.count()).toBe(0);
  });

  it('should support forEach iteration', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    world.addComponent(e1, new Position());
    world.addComponent(e2, new Position());

    const collected: number[] = [];
    const query = world.createQuery({ with: [Position] });
    query.forEach((entity) => collected.push(entity));
    expect(collected.length).toBe(2);
  });

  it('should return first entity', () => {
    const e1 = world.createEntity();
    world.createEntity();
    world.addComponent(e1, new Position());

    const query = world.createQuery({ with: [Position] });
    expect(query.first()).toBe(e1);
  });

  it('should return undefined first when empty', () => {
    const query = world.createQuery({ with: [Position] });
    expect(query.first()).toBeUndefined();
  });

  it('should handle complex query with with and without', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    const e3 = world.createEntity();
    const e4 = world.createEntity();

    // e1: Pos + Vel + Health
    world.addComponent(e1, new Position());
    world.addComponent(e1, new Velocity());
    world.addComponent(e1, new Health());

    // e2: Pos + Vel
    world.addComponent(e2, new Position());
    world.addComponent(e2, new Velocity());

    // e3: Pos + Health
    world.addComponent(e3, new Position());
    world.addComponent(e3, new Health());

    // e4: Pos only
    world.addComponent(e4, new Position());

    const query = world.createQuery({ with: [Position], without: [Velocity, Health] });
    expect(query.count()).toBe(1);
    expect(query.entities).toContain(e4);
  });
});

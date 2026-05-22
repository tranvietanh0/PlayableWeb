import { describe, it, expect, beforeEach, vi } from 'vitest';
import { World } from '../World.js';
import { System } from '../System.js';

class Position {
  constructor(public x = 0, public y = 0) {}
}

class Velocity {
  constructor(public vx = 0, public vy = 0) {}
}

class Health {
  constructor(public hp = 100) {}
}

describe('World', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  it('should create and destroy entities', () => {
    const e = world.createEntity();
    expect(world.isAlive(e)).toBe(true);
    expect(world.destroyEntity(e)).toBe(true);
    expect(world.isAlive(e)).toBe(false);
  });

  it('should add and get components', () => {
    const e = world.createEntity();
    const pos = new Position(1, 2);
    world.addComponent(e, pos);
    expect(world.getComponent(e, Position)).toBe(pos);
  });

  it('should throw when adding component to dead entity', () => {
    const e = world.createEntity();
    world.destroyEntity(e);
    expect(() => world.addComponent(e, new Position())).toThrow(/dead entity/);
  });

  it('should remove components', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position());
    expect(world.removeComponent(e, Position)).toBe(true);
    expect(world.getComponent(e, Position)).toBeUndefined();
  });

  it('should clean up components on entity destroy', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position());
    world.destroyEntity(e);
    expect(world.getComponent(e, Position)).toBeUndefined();
  });

  it('should run systems in priority order', () => {
    const order: string[] = [];
    world.addSystem({
      name: 'B',
      priority: 2,
      update: () => order.push('B'),
    });
    world.addSystem({
      name: 'A',
      priority: 1,
      update: () => order.push('A'),
    });
    world.addSystem({
      name: 'C',
      priority: 3,
      update: () => order.push('C'),
    });
    world.update(0.016);
    expect(order).toEqual(['A', 'B', 'C']);
  });

  it('should pass deltaTime to systems', () => {
    let receivedDt = 0;
    world.addSystem({
      name: 'dt-check',
      update: (_w, dt) => {
        receivedDt = dt;
      },
    });
    world.update(0.033);
    expect(receivedDt).toBe(0.033);
  });

  it('should remove a system by name', () => {
    world.addSystem({ name: 's1', update: vi.fn() });
    expect(world.removeSystem('s1')).toBe(true);
    expect(world.removeSystem('s1')).toBe(false);
  });

  it('should get a system by name', () => {
    const sys = new System({ name: 's1', update: vi.fn() });
    world.addSystem(sys);
    expect(world.getSystem('s1')).toBe(sys);
    expect(world.getSystem('missing')).toBeUndefined();
  });

  it('should accumulate time', () => {
    world.update(0.016);
    world.update(0.016);
    expect(world.time).toBeCloseTo(0.032, 3);
  });

  it('should clear everything', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position());
    world.addSystem({ name: 's1', update: vi.fn() });
    world.update(0.1);
    world.clear();
    expect(world.isAlive(e)).toBe(false);
    expect(world.getSystem('s1')).toBeUndefined();
    expect(world.time).toBe(0);
  });
});

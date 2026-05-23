import { describe, it, expect, beforeEach, vi } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec2, Vec3 } from '@pwe/math';
import { SceneSerializer } from '../SceneSerializer.js';

class Position {
  constructor(public x = 0, public y = 0) {}
}

class Velocity {
  constructor(public vx = 0, public vy = 0) {}
}

class Transform {
  position = new Vec3(0, 0, 0);
  scale = new Vec2(1, 1);
}

describe('SceneSerializer', () => {
  let world: World;
  let serializer: SceneSerializer;

  beforeEach(() => {
    world = new World();
    serializer = new SceneSerializer();
    serializer.registerComponentType('Position', Position);
    serializer.registerComponentType('Velocity', Velocity);
    serializer.registerComponentType('Transform', Transform);
  });

  it('should round-trip serialize and deserialize', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position(10, 20));
    world.addComponent(e, new Velocity(1, 2));

    const scene = serializer.serialize(world);
    expect(scene.version).toBe(1);
    expect(scene.entities).toHaveLength(1);
    expect(scene.entities[0]!.components).toHaveLength(2);

    // Clear and deserialize
    world.clear();
    const created = serializer.deserialize(world, scene);
    expect(created).toHaveLength(1);

    const restoredPos = world.getComponent(created[0]!, Position);
    expect(restoredPos).toBeDefined();
    expect(restoredPos!.x).toBe(10);
    expect(restoredPos!.y).toBe(20);

    const restoredVel = world.getComponent(created[0]!, Velocity);
    expect(restoredVel).toBeDefined();
    expect(restoredVel!.vx).toBe(1);
    expect(restoredVel!.vy).toBe(2);
  });

  it('should serialize math types correctly', () => {
    const e = world.createEntity();
    const transform = new Transform();
    transform.position = new Vec3(1, 2, 3);
    transform.scale = new Vec2(2, 2);
    world.addComponent(e, transform);

    const scene = serializer.serialize(world);
    const compData = scene.entities[0]!.components[0]!.data as Record<string, unknown>;
    expect(compData['position']).toEqual({ __type: 'Vec3', x: 1, y: 2, z: 3 });
    expect(compData['scale']).toEqual({ __type: 'Vec2', x: 2, y: 2 });
  });

  it('should deserialize math types correctly', () => {
    const e = world.createEntity();
    const transform = new Transform();
    transform.position = new Vec3(5, 10, 15);
    world.addComponent(e, transform);

    const scene = serializer.serialize(world);
    world.clear();

    serializer.deserialize(world, scene);

    const all = world.getEntitiesWith(Transform);
    expect(all).toHaveLength(1);

    const t = world.getComponent(all[0]!, Transform);
    expect(t).toBeDefined();
    expect(t!.position).toBeInstanceOf(Vec3);
    expect(t!.position.x).toBe(5);
    expect(t!.position.y).toBe(10);
    expect(t!.position.z).toBe(15);
  });

  it('should skip unknown components during deserialization with warning', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position(1, 2));

    const scene = serializer.serialize(world);
    // Manually inject an unknown component
    scene.entities[0]!.components.push({ type: 'UnknownType', data: {} });

    world.clear();

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    serializer.deserialize(world, scene);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('UnknownType'));
    warnSpy.mockRestore();

    // Position should still be restored
    const all = world.getEntitiesWith(Position);
    expect(all).toHaveLength(1);
  });

  it('should throw on unsupported scene version', () => {
    expect(() => serializer.deserialize(world, { version: 99, entities: [] })).toThrow(/Unsupported scene version/);
  });

  it('should clone an entity', () => {
    const e = world.createEntity();
    world.addComponent(e, new Position(3, 4));
    world.addComponent(e, new Velocity(5, 6));

    const clone = serializer.clone(world, e);
    expect(clone).toBeDefined();
    expect(clone).not.toBe(e);

    const clonePos = world.getComponent(clone!, Position);
    expect(clonePos).toBeDefined();
    expect(clonePos!.x).toBe(3);
    expect(clonePos!.y).toBe(4);

    const cloneVel = world.getComponent(clone!, Velocity);
    expect(cloneVel).toBeDefined();
    expect(cloneVel!.vx).toBe(5);
    expect(cloneVel!.vy).toBe(6);
  });

  it('should return undefined when cloning dead entity', () => {
    const e = world.createEntity();
    world.destroyEntity(e);
    expect(serializer.clone(world, e)).toBeUndefined();
  });

  it('should handle empty world', () => {
    const scene = serializer.serialize(world);
    expect(scene.entities).toHaveLength(0);

    const created = serializer.deserialize(world, scene);
    expect(created).toHaveLength(0);
  });

  it('should handle multiple entities', () => {
    const e1 = world.createEntity();
    world.addComponent(e1, new Position(1, 1));

    const e2 = world.createEntity();
    world.addComponent(e2, new Position(2, 2));
    world.addComponent(e2, new Velocity(10, 20));

    const scene = serializer.serialize(world);
    expect(scene.entities).toHaveLength(2);

    world.clear();
    serializer.deserialize(world, scene);

    const positions = world.getEntitiesWith(Position);
    expect(positions).toHaveLength(2);

    const velocities = world.getEntitiesWith(Velocity);
    expect(velocities).toHaveLength(1);
  });
});

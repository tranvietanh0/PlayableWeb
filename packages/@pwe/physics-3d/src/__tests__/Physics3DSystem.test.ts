import { describe, it, expect, vi, beforeEach } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec3 } from '@pwe/math';
import { SignalBus } from '@pwe/signalbus';

// Polyfill performance.now for Rapier WASM before importing the module
if (typeof globalThis.performance === 'undefined') {
  Object.defineProperty(globalThis, 'performance', {
    value: { now: () => Date.now() } as Performance,
    writable: true,
    configurable: true,
  });
} else if (!globalThis.performance.now) {
  globalThis.performance.now = () => Date.now();
}

import { Physics3DSystem, RigidBody3D, BoxCollider3D, SphereCollider3D, CapsuleCollider3D } from '../index.js';

describe('Physics3DSystem', () => {
  let world: World;
  let signalBus: SignalBus;
  let physics: Physics3DSystem;

  beforeEach(() => {
    world = new World();
    signalBus = new SignalBus();
    physics = new Physics3DSystem(
      { gravity: new Vec3(0, -10, 0), timeStep: 1 / 60 },
      signalBus
    );
  });

  it('creates a body for an entity with RigidBody3D', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new BoxCollider3D(new Vec3(1, 1, 1)));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
    expect(body!.bodyType()).toBe(0);
  });

  it('creates a static body', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('static'));
    world.addComponent(entity, new BoxCollider3D(new Vec3(2, 2, 2)));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
    expect(body!.bodyType()).toBe(1);
  });

  it('creates a sphere collider', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new SphereCollider3D(0.5));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
  });

  it('creates a capsule collider', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new CapsuleCollider3D(0.5, 0.25));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
  });

  it('applies gravity over time', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new SphereCollider3D(0.5));

    physics.step(world, 1 / 60);

    for (let i = 0; i < 60; i++) {
      physics.step(world, 1 / 60);
    }

    const body = physics.getBody(entity);
    const vel = body!.linvel();
    expect(vel.y).toBeLessThan(-0.1);
  });

  it('removes body when entity is destroyed', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new BoxCollider3D());

    physics.step(world, 1 / 60);
    expect(physics.getBody(entity)).toBeDefined();

    world.destroyEntity(entity);
    physics.step(world, 1 / 60);

    expect(physics.getBody(entity)).toBeUndefined();
  });

  it('allows applying force to a body', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new BoxCollider3D());

    physics.step(world, 1 / 60);

    physics.applyForce(entity, new Vec3(100, 0, 0));
    physics.step(world, 1 / 60);

    const vel = physics.getLinearVelocity(entity);
    expect(vel.x).toBeGreaterThan(0);
  });

  it('allows setting linear velocity', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new BoxCollider3D());

    physics.step(world, 1 / 60);
    physics.setLinearVelocity(entity, new Vec3(5, 3, 1));

    const vel = physics.getLinearVelocity(entity);
    expect(vel.x).toBeCloseTo(5, 3);
    expect(vel.y).toBeCloseTo(3, 3);
    expect(vel.z).toBeCloseTo(1, 3);
  });

  it('exposes systemUpdate function for Engine integration', () => {
    expect(typeof physics.systemUpdate).toBe('function');
  });

  it('allows changing gravity', () => {
    physics.setGravity(new Vec3(0, -20, 0));
    expect(physics.config.gravity.y).toBe(-20);
  });

  it('cleans up bodies on dispose', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody3D('dynamic'));
    world.addComponent(entity, new BoxCollider3D());

    physics.step(world, 1 / 60);
    expect(physics.getBody(entity)).toBeDefined();

    physics.dispose();
    expect(physics.getBody(entity)).toBeUndefined();
  });
});

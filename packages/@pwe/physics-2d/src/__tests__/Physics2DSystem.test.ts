import { describe, it, expect, vi, beforeEach } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec2 } from '@pwe/math';
import { SignalBus } from '@pwe/signalbus';
import { Physics2DSystem, RigidBody2D, BoxCollider2D, CircleCollider2D } from '../index.js';

describe('Physics2DSystem', () => {
  let world: World;
  let signalBus: SignalBus;
  let physics: Physics2DSystem;

  beforeEach(() => {
    world = new World();
    signalBus = new SignalBus();
    physics = new Physics2DSystem(
      { gravity: new Vec2(0, -10), timeStep: 1 / 60 },
      signalBus
    );
  });

  it('creates a body for an entity with RigidBody2D', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new BoxCollider2D(new Vec2(1, 1)));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
    expect(body!.getType()).toBe('dynamic');
  });

  it('creates a static body', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('static'));
    world.addComponent(entity, new BoxCollider2D(new Vec2(2, 2)));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
    expect(body!.getType()).toBe('static');
  });

  it('creates a circle collider', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new CircleCollider2D(0.5));

    physics.step(world, 1 / 60);

    const body = physics.getBody(entity);
    expect(body).toBeDefined();
    const fixture = body!.getFixtureList();
    expect(fixture).toBeDefined();
    expect(fixture!.getShape().getType()).toBe('circle');
  });

  it('applies gravity over time', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new CircleCollider2D(0.5));

    physics.step(world, 1 / 60);

    // Step multiple times to see gravity effect
    for (let i = 0; i < 60; i++) {
      physics.step(world, 1 / 60);
    }

    const body = physics.getBody(entity);
    const vel = body!.getLinearVelocity();
    expect(vel.y).toBeLessThan(-0.1); // Should have some downward velocity
  });

  it('removes body when entity is destroyed', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new BoxCollider2D());

    physics.step(world, 1 / 60);
    expect(physics.getBody(entity)).toBeDefined();

    world.destroyEntity(entity);
    physics.step(world, 1 / 60);

    expect(physics.getBody(entity)).toBeUndefined();
  });

  it('emits collision events via SignalBus', () => {
    const handler = vi.fn();
    signalBus.subscribe('collision:begin', handler);

    const entityA = world.createEntity();
    world.addComponent(entityA, new RigidBody2D('dynamic'));
    world.addComponent(entityA, new BoxCollider2D(new Vec2(1, 1)));

    const entityB = world.createEntity();
    world.addComponent(entityB, new RigidBody2D('static'));
    world.addComponent(entityB, new BoxCollider2D(new Vec2(1, 1)));

    physics.step(world, 1 / 60);

    // Position them so they overlap
    const bodyA = physics.getBody(entityA)!;
    const bodyB = physics.getBody(entityB)!;
    bodyA.setPosition({ x: 0, y: 0 });
    bodyB.setPosition({ x: 0, y: 0 });

    // Step to trigger collision
    for (let i = 0; i < 10; i++) {
      physics.step(world, 1 / 60);
    }

    expect(handler).toHaveBeenCalled();
    const event = handler.mock.calls[0]![0];
    expect(event.entityA).toBeDefined();
    expect(event.entityB).toBeDefined();
  });

  it('allows applying force to a body', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new BoxCollider2D());

    physics.step(world, 1 / 60);

    physics.applyForce(entity, new Vec2(100, 0));
    physics.step(world, 1 / 60);

    const vel = physics.getLinearVelocity(entity);
    expect(vel.x).toBeGreaterThan(0);
  });

  it('allows setting linear velocity', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new BoxCollider2D());

    physics.step(world, 1 / 60);
    physics.setLinearVelocity(entity, new Vec2(5, 3));

    const vel = physics.getLinearVelocity(entity);
    expect(vel.x).toBeCloseTo(5, 3);
    expect(vel.y).toBeCloseTo(3, 3);
  });

  it('exposes update function for Engine integration', () => {
    expect(typeof physics.systemUpdate).toBe('function');
  });

  it('allows changing gravity', () => {
    physics.setGravity(new Vec2(0, -20));
    expect(physics.config.gravity.y).toBe(-20);
  });

  it('cleans up bodies on dispose', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new RigidBody2D('dynamic'));
    world.addComponent(entity, new BoxCollider2D());

    physics.step(world, 1 / 60);
    expect(physics.getBody(entity)).toBeDefined();

    physics.dispose();
    expect(physics.getBody(entity)).toBeUndefined();
  });
});

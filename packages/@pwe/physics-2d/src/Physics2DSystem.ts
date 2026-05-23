import type { World, Entity, SystemUpdateFn } from '@pwe/ecs-core';
import type { SignalBus } from '@pwe/signalbus';
import { Vec2 } from '@pwe/math';
import * as planck from 'planck-js';
import { RigidBody2D, BoxCollider2D, CircleCollider2D, type BodyType } from './components.js';

export interface Physics2DConfig {
  gravity?: Vec2;
  timeStep?: number;
  velocityIterations?: number;
  positionIterations?: number;
}

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  normal: Vec2;
  contactPoints: Vec2[];
}

export class Physics2DSystem {
  private _world: planck.World;
  private _bodyMap = new Map<Entity, planck.Body>();
  private _entityMap = new Map<planck.Body, Entity>();
  private _config: Required<Physics2DConfig>;
  private _signalBus?: SignalBus;
  private _accumulator = 0;
  private _updateFn: SystemUpdateFn;

  constructor(config: Physics2DConfig = {}, signalBus?: SignalBus) {
    this._config = {
      gravity: config.gravity ?? new Vec2(0, -9.81),
      timeStep: config.timeStep ?? 1 / 60,
      velocityIterations: config.velocityIterations ?? 6,
      positionIterations: config.positionIterations ?? 2,
    };
    this._signalBus = signalBus;
    this._world = new planck.World({
      gravity: { x: this._config.gravity.x, y: this._config.gravity.y },
    });
    this._updateFn = (world: World, dt: number) => {
      this.step(world, dt);
    };
    this._setupCollisionListener();
  }

  get systemUpdate(): SystemUpdateFn {
    return this._updateFn;
  }

  get physicsWorld(): planck.World {
    return this._world;
  }

  get config(): Required<Physics2DConfig> {
    return this._config;
  }

  setGravity(gravity: Vec2): void {
    this._config.gravity = gravity;
    this._world.setGravity({ x: gravity.x, y: gravity.y });
  }

  step(world: World, dt: number): void {
    // Sync ECS -> Physics: create bodies for new entities
    const entities = world.getEntitiesWith(RigidBody2D);
    for (const entity of entities) {
      const body = this._bodyMap.get(entity);
      if (!body) {
        this._createBody(world, entity);
      } else {
        this._syncToPhysics(world, entity, body);
      }
    }

    // Remove bodies for destroyed entities
    for (const [entity, body] of this._bodyMap) {
      if (!world.isAlive(entity)) {
        this._world.destroyBody(body);
        this._entityMap.delete(body);
        this._bodyMap.delete(entity);
      }
    }

    // Step physics with fixed timestep
    this._accumulator += dt;
    while (this._accumulator >= this._config.timeStep) {
      this._world.step(
        this._config.timeStep,
        this._config.velocityIterations,
        this._config.positionIterations
      );
      this._accumulator -= this._config.timeStep;
    }

    // Sync Physics -> ECS: update transforms
    for (const [entity, body] of this._bodyMap) {
      const pos = body.getPosition();
      const angle = body.getAngle();
      // Emit transform update via signal so render systems can listen
      this._signalBus?.emit('physics:transform2d', {
        entity,
        position: new Vec2(pos.x, pos.y),
        angle,
      });
    }
  }

  getBody(entity: Entity): planck.Body | undefined {
    return this._bodyMap.get(entity);
  }

  getEntity(body: planck.Body): Entity | undefined {
    return this._entityMap.get(body);
  }

  applyForce(entity: Entity, force: Vec2, point?: Vec2): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    body.applyForce(
      { x: force.x, y: force.y },
      point ? { x: point.x, y: point.y } : body.getWorldCenter(),
      true
    );
  }

  applyLinearImpulse(entity: Entity, impulse: Vec2, point?: Vec2): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    body.applyLinearImpulse(
      { x: impulse.x, y: impulse.y },
      point ? { x: point.x, y: point.y } : body.getWorldCenter(),
      true
    );
  }

  setLinearVelocity(entity: Entity, velocity: Vec2): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    body.setLinearVelocity({ x: velocity.x, y: velocity.y });
  }

  getLinearVelocity(entity: Entity): Vec2 {
    const body = this._bodyMap.get(entity);
    if (!body) return Vec2.ZERO;
    const v = body.getLinearVelocity();
    return new Vec2(v.x, v.y);
  }

  dispose(): void {
    // Destroy all bodies
    let body = this._world.getBodyList();
    while (body) {
      const next = body.getNext();
      this._world.destroyBody(body);
      body = next;
    }
    this._bodyMap.clear();
    this._entityMap.clear();
  }

  private _createBody(world: World, entity: Entity): void {
    const rb = world.getComponent(entity, RigidBody2D);
    if (!rb) return;

    const bodyDef: planck.BodyDef = {
      type: this._mapBodyType(rb.bodyType),
      linearVelocity: { x: rb.linearVelocity.x, y: rb.linearVelocity.y },
      angularVelocity: rb.angularVelocity,
      linearDamping: rb.linearDamping,
      angularDamping: rb.angularDamping,
      fixedRotation: rb.fixedRotation,
      gravityScale: rb.gravityScale,
      bullet: rb.bullet,
    };

    const body = this._world.createBody(bodyDef);
    this._bodyMap.set(entity, body);
    this._entityMap.set(body, entity);

    // Add colliders
    const box = world.getComponent(entity, BoxCollider2D);
    if (box) {
      body.createFixture({
        shape: planck.Box(box.size.x / 2, box.size.y / 2, { x: box.offset.x, y: box.offset.y }),
        density: box.density,
        friction: box.friction,
        restitution: box.restitution,
        isSensor: box.isSensor,
      });
    }

    const circle = world.getComponent(entity, CircleCollider2D);
    if (circle) {
      body.createFixture({
        shape: planck.Circle({ x: circle.offset.x, y: circle.offset.y }, circle.radius),
        density: circle.density,
        friction: circle.friction,
        restitution: circle.restitution,
        isSensor: circle.isSensor,
      });
    }
  }

  private _syncToPhysics(world: World, entity: Entity, body: planck.Body): void {
    const rb = world.getComponent(entity, RigidBody2D);
    if (!rb) return;

    // Sync dynamic properties that may have changed
    body.setGravityScale(rb.gravityScale);
    body.setLinearDamping(rb.linearDamping);
    body.setAngularDamping(rb.angularDamping);
    body.setBullet(rb.bullet);
    body.setFixedRotation(rb.fixedRotation);

    // If velocity was explicitly changed in component, sync it
    const vel = body.getLinearVelocity();
    if (!rb.linearVelocity.equals(new Vec2(vel.x, vel.y))) {
      body.setLinearVelocity({ x: rb.linearVelocity.x, y: rb.linearVelocity.y });
    }
  }

  private _mapBodyType(type: BodyType): planck.BodyType {
    switch (type) {
      case 'static':
        return 'static';
      case 'kinematic':
        return 'kinematic';
      case 'dynamic':
        return 'dynamic';
      default:
        return 'dynamic';
    }
  }

  private _setupCollisionListener(): void {
    this._world.on('begin-contact', (contact: planck.Contact) => {
      if (!this._signalBus) return;
      const bodyA = contact.getFixtureA().getBody();
      const bodyB = contact.getFixtureB().getBody();
      const entityA = this._entityMap.get(bodyA);
      const entityB = this._entityMap.get(bodyB);
      if (entityA === undefined || entityB === undefined) return;

      const manifold = contact.getManifold();
      const worldManifold = contact.getWorldManifold(null);
      const points: Vec2[] = [];
      if (worldManifold && worldManifold.points) {
        for (let i = 0; i < manifold.pointCount; i++) {
          const p = worldManifold.points[i];
          if (p) points.push(new Vec2(p.x, p.y));
        }
      }

      const normal = worldManifold?.normal ?? { x: 0, y: 0 };

      const event: CollisionEvent = {
        entityA,
        entityB,
        normal: new Vec2(normal.x, normal.y),
        contactPoints: points,
      };

      this._signalBus.emit('collision:begin', event);
    });

    this._world.on('end-contact', (contact: planck.Contact) => {
      if (!this._signalBus) return;
      const bodyA = contact.getFixtureA().getBody();
      const bodyB = contact.getFixtureB().getBody();
      const entityA = this._entityMap.get(bodyA);
      const entityB = this._entityMap.get(bodyB);
      if (entityA === undefined || entityB === undefined) return;

      this._signalBus.emit('collision:end', { entityA, entityB });
    });
  }
}

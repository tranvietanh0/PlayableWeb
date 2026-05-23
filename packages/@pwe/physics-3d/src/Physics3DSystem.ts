import type { World, Entity, SystemUpdateFn } from '@pwe/ecs-core';
import type { SignalBus } from '@pwe/signalbus';
import { Vec3, Quat } from '@pwe/math';
import * as RAPIER from '@dimforge/rapier3d';
import { RigidBody3D, BoxCollider3D, SphereCollider3D, CapsuleCollider3D, type BodyType3D } from './components.js';

export interface Physics3DConfig {
  gravity?: Vec3;
  timeStep?: number;
  substeps?: number;
}

export interface CollisionEvent3D {
  entityA: Entity;
  entityB: Entity;
  normal: Vec3;
}

export class Physics3DSystem {
  private _world: RAPIER.World;
  private _bodyMap = new Map<Entity, RAPIER.RigidBody>();
  private _colliderMap = new Map<Entity, RAPIER.Collider[]>();
  private _entityMap = new Map<RAPIER.RigidBody, Entity>();
  private _config: Required<Physics3DConfig>;
  private _signalBus?: SignalBus;
  private _accumulator = 0;
  private _updateFn: SystemUpdateFn;
  private _eventQueue: RAPIER.EventQueue;

  constructor(config: Physics3DConfig = {}, signalBus?: SignalBus) {
    this._config = {
      gravity: config.gravity ?? new Vec3(0, -9.81, 0),
      timeStep: config.timeStep ?? 1 / 60,
      substeps: config.substeps ?? 1,
    };
    this._signalBus = signalBus;
    this._world = new RAPIER.World({
      x: this._config.gravity.x,
      y: this._config.gravity.y,
      z: this._config.gravity.z,
    });
    this._eventQueue = new RAPIER.EventQueue(true);
    this._updateFn = (world: World, dt: number) => {
      this.step(world, dt);
    };
  }

  get systemUpdate(): SystemUpdateFn {
    return this._updateFn;
  }

  get physicsWorld(): RAPIER.World {
    return this._world;
  }

  get config(): Required<Physics3DConfig> {
    return this._config;
  }

  setGravity(gravity: Vec3): void {
    this._config.gravity = gravity;
    this._world.gravity = { x: gravity.x, y: gravity.y, z: gravity.z };
  }

  step(world: World, dt: number): void {
    // Sync ECS -> Physics: create bodies for new entities
    const entities = world.getEntitiesWith(RigidBody3D);
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
        this._world.removeRigidBody(body);
        this._entityMap.delete(body);
        this._bodyMap.delete(entity);
        this._colliderMap.delete(entity);
      }
    }

    // Step physics with fixed timestep
    this._accumulator += dt;
    while (this._accumulator >= this._config.timeStep) {
      this._world.step(this._eventQueue);
      this._processCollisionEvents();
      this._accumulator -= this._config.timeStep;
    }

    // Sync Physics -> ECS: update transforms
    for (const [entity, body] of this._bodyMap) {
      const pos = body.translation();
      const rot = body.rotation();
      this._signalBus?.emit('physics:transform3d', {
        entity,
        position: new Vec3(pos.x, pos.y, pos.z),
        rotation: new Quat(rot.x, rot.y, rot.z, rot.w),
      });
    }
  }

  getBody(entity: Entity): RAPIER.RigidBody | undefined {
    return this._bodyMap.get(entity);
  }

  getEntity(body: RAPIER.RigidBody): Entity | undefined {
    return this._entityMap.get(body);
  }

  applyForce(entity: Entity, force: Vec3, point?: Vec3): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    if (point) {
      body.addForceAtPoint(
        { x: force.x, y: force.y, z: force.z },
        { x: point.x, y: point.y, z: point.z },
        true
      );
    } else {
      body.addForce({ x: force.x, y: force.y, z: force.z }, true);
    }
  }

  applyImpulse(entity: Entity, impulse: Vec3, point?: Vec3): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    if (point) {
      body.applyImpulseAtPoint(
        { x: impulse.x, y: impulse.y, z: impulse.z },
        { x: point.x, y: point.y, z: point.z },
        true
      );
    } else {
      body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
    }
  }

  setLinearVelocity(entity: Entity, velocity: Vec3): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  getLinearVelocity(entity: Entity): Vec3 {
    const body = this._bodyMap.get(entity);
    if (!body) return Vec3.ZERO;
    const v = body.linvel();
    return new Vec3(v.x, v.y, v.z);
  }

  setAngularVelocity(entity: Entity, velocity: Vec3): void {
    const body = this._bodyMap.get(entity);
    if (!body) return;
    body.setAngvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  dispose(): void {
    this._bodyMap.clear();
    this._entityMap.clear();
    this._colliderMap.clear();
    this._world.free();
  }

  private _createBody(world: World, entity: Entity): void {
    const rb = world.getComponent(entity, RigidBody3D);
    if (!rb) return;

    const bodyDesc = this._mapBodyType(rb.bodyType);
    bodyDesc.setLinvel(rb.linearVelocity.x, rb.linearVelocity.y, rb.linearVelocity.z);
    bodyDesc.setAngvel({ x: rb.angularVelocity.x, y: rb.angularVelocity.y, z: rb.angularVelocity.z });
    bodyDesc.setLinearDamping(rb.linearDamping);
    bodyDesc.setAngularDamping(rb.angularDamping);
    bodyDesc.setGravityScale(rb.gravityScale);
    bodyDesc.setCcdEnabled(rb.ccdEnabled);

    const body = this._world.createRigidBody(bodyDesc);
    this._bodyMap.set(entity, body);
    this._entityMap.set(body, entity);

    const colliders: RAPIER.Collider[] = [];

    const box = world.getComponent(entity, BoxCollider3D);
    if (box) {
      const colliderDesc = RAPIER.ColliderDesc.cuboid(box.size.x / 2, box.size.y / 2, box.size.z / 2)
        .setTranslation(box.offset.x, box.offset.y, box.offset.z)
        .setDensity(box.density)
        .setFriction(box.friction)
        .setRestitution(box.restitution)
        .setSensor(box.isSensor);
      const collider = this._world.createCollider(colliderDesc, body);
      colliders.push(collider);
    }

    const sphere = world.getComponent(entity, SphereCollider3D);
    if (sphere) {
      const colliderDesc = RAPIER.ColliderDesc.ball(sphere.radius)
        .setTranslation(sphere.offset.x, sphere.offset.y, sphere.offset.z)
        .setDensity(sphere.density)
        .setFriction(sphere.friction)
        .setRestitution(sphere.restitution)
        .setSensor(sphere.isSensor);
      const collider = this._world.createCollider(colliderDesc, body);
      colliders.push(collider);
    }

    const capsule = world.getComponent(entity, CapsuleCollider3D);
    if (capsule) {
      const colliderDesc = RAPIER.ColliderDesc.capsule(capsule.halfHeight, capsule.radius)
        .setTranslation(capsule.offset.x, capsule.offset.y, capsule.offset.z)
        .setDensity(capsule.density)
        .setFriction(capsule.friction)
        .setRestitution(capsule.restitution)
        .setSensor(capsule.isSensor);
      const collider = this._world.createCollider(colliderDesc, body);
      colliders.push(collider);
    }

    if (colliders.length > 0) {
      this._colliderMap.set(entity, colliders);
    }
  }

  private _syncToPhysics(world: World, entity: Entity, body: RAPIER.RigidBody): void {
    const rb = world.getComponent(entity, RigidBody3D);
    if (!rb) return;

    body.setGravityScale(rb.gravityScale, true);
    body.setLinearDamping(rb.linearDamping);
    body.setAngularDamping(rb.angularDamping);
    // body.setCcdEnabled(rb.ccdEnabled); // Not available in rapier3d 0.19

    const vel = body.linvel();
    if (!rb.linearVelocity.equals(new Vec3(vel.x, vel.y, vel.z))) {
      body.setLinvel({ x: rb.linearVelocity.x, y: rb.linearVelocity.y, z: rb.linearVelocity.z }, true);
    }
  }

  private _mapBodyType(type: BodyType3D): RAPIER.RigidBodyDesc {
    switch (type) {
      case 'static':
        return RAPIER.RigidBodyDesc.fixed();
      case 'kinematic':
        return RAPIER.RigidBodyDesc.kinematicPositionBased();
      case 'dynamic':
        return RAPIER.RigidBodyDesc.dynamic();
      default:
        return RAPIER.RigidBodyDesc.dynamic();
    }
  }

  private _processCollisionEvents(): void {
    if (!this._signalBus) return;

    this._eventQueue.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
      const collider1 = this._world.getCollider(handle1);
      const collider2 = this._world.getCollider(handle2);
      if (!collider1 || !collider2) return;

      const body1 = collider1.parent();
      const body2 = collider2.parent();
      if (!body1 || !body2) return;

      const entityA = this._entityMap.get(body1);
      const entityB = this._entityMap.get(body2);
      if (entityA === undefined || entityB === undefined) return;

      if (started) {
        this._signalBus!.emit('collision3d:begin', { entityA, entityB });
      } else {
        this._signalBus!.emit('collision3d:end', { entityA, entityB });
      }
    });
  }
}

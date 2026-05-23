import { Vec2 } from '@pwe/math';

export type BodyType = 'static' | 'kinematic' | 'dynamic';

export class RigidBody2D {
  constructor(
    public bodyType: BodyType = 'dynamic',
    public linearVelocity: Vec2 = Vec2.ZERO,
    public angularVelocity: number = 0,
    public linearDamping: number = 0,
    public angularDamping: number = 0,
    public fixedRotation: boolean = false,
    public gravityScale: number = 1,
    public bullet: boolean = false
  ) {}
}

export class BoxCollider2D {
  constructor(
    public size: Vec2 = new Vec2(1, 1),
    public offset: Vec2 = Vec2.ZERO,
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0,
    public isSensor: boolean = false
  ) {}
}

export class CircleCollider2D {
  constructor(
    public radius: number = 0.5,
    public offset: Vec2 = Vec2.ZERO,
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0,
    public isSensor: boolean = false
  ) {}
}

export class PhysicsMaterial2D {
  constructor(
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0
  ) {}
}

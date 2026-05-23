import { Vec3, Quat } from '@pwe/math';

export type BodyType3D = 'static' | 'kinematic' | 'dynamic';

export class RigidBody3D {
  constructor(
    public bodyType: BodyType3D = 'dynamic',
    public linearVelocity: Vec3 = Vec3.ZERO,
    public angularVelocity: Vec3 = Vec3.ZERO,
    public linearDamping: number = 0,
    public angularDamping: number = 0,
    public gravityScale: number = 1,
    public ccdEnabled: boolean = false
  ) {}
}

export class BoxCollider3D {
  constructor(
    public size: Vec3 = new Vec3(1, 1, 1),
    public offset: Vec3 = Vec3.ZERO,
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0,
    public isSensor: boolean = false
  ) {}
}

export class SphereCollider3D {
  constructor(
    public radius: number = 0.5,
    public offset: Vec3 = Vec3.ZERO,
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0,
    public isSensor: boolean = false
  ) {}
}

export class CapsuleCollider3D {
  constructor(
    public halfHeight: number = 0.5,
    public radius: number = 0.25,
    public offset: Vec3 = Vec3.ZERO,
    public density: number = 1,
    public friction: number = 0.3,
    public restitution: number = 0,
    public isSensor: boolean = false
  ) {}
}

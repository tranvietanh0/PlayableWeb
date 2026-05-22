export class Vec3 {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  static readonly ZERO = new Vec3(0, 0, 0);
  static readonly ONE = new Vec3(1, 1, 1);
  static readonly UP = new Vec3(0, 1, 0);
  static readonly RIGHT = new Vec3(1, 0, 0);
  static readonly FORWARD = new Vec3(0, 0, 1);

  static add(a: Vec3, b: Vec3): Vec3 {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static sub(a: Vec3, b: Vec3): Vec3 {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static mul(a: Vec3, s: number): Vec3 {
    return new Vec3(a.x * s, a.y * s, a.z * s);
  }

  static div(a: Vec3, s: number): Vec3 {
    return new Vec3(a.x / s, a.y / s, a.z / s);
  }

  static dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a: Vec3, b: Vec3): Vec3 {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return new Vec3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  static distance(a: Vec3, b: Vec3): number {
    return Vec3.sub(a, b).length;
  }

  static distanceSquared(a: Vec3, b: Vec3): number {
    return Vec3.sub(a, b).lengthSquared;
  }

  static fromArray(arr: readonly number[]): Vec3 {
    if (arr.length < 3) throw new Error('Array must have at least 3 elements');
    return new Vec3(arr[0]!, arr[1]!, arr[2]!);
  }

  add(other: Vec3): Vec3 {
    return Vec3.add(this, other);
  }

  sub(other: Vec3): Vec3 {
    return Vec3.sub(this, other);
  }

  mul(s: number): Vec3 {
    return Vec3.mul(this, s);
  }

  div(s: number): Vec3 {
    return Vec3.div(this, s);
  }

  dot(other: Vec3): number {
    return Vec3.dot(this, other);
  }

  cross(other: Vec3): Vec3 {
    return Vec3.cross(this, other);
  }

  lerp(other: Vec3, t: number): Vec3 {
    return Vec3.lerp(this, other, t);
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  get lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vec3 {
    const len = this.length;
    if (len === 0) return Vec3.ZERO;
    return this.div(len);
  }

  negate(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  equals(other: Vec3, epsilon = 1e-6): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }
}

export class Vec2 {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  static readonly ZERO = new Vec2(0, 0);
  static readonly ONE = new Vec2(1, 1);
  static readonly UP = new Vec2(0, 1);
  static readonly RIGHT = new Vec2(1, 0);

  static add(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static mul(a: Vec2, s: number): Vec2 {
    return new Vec2(a.x * s, a.y * s);
  }

  static div(a: Vec2, s: number): Vec2 {
    return new Vec2(a.x / s, a.y / s);
  }

  static dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Vec2, b: Vec2): number {
    return a.x * b.y - a.y * b.x;
  }

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  static distance(a: Vec2, b: Vec2): number {
    return Vec2.sub(a, b).length;
  }

  static distanceSquared(a: Vec2, b: Vec2): number {
    return Vec2.sub(a, b).lengthSquared;
  }

  static fromArray(arr: readonly number[]): Vec2 {
    if (arr.length < 2) throw new Error('Array must have at least 2 elements');
    return new Vec2(arr[0]!, arr[1]!);
  }

  add(other: Vec2): Vec2 {
    return Vec2.add(this, other);
  }

  sub(other: Vec2): Vec2 {
    return Vec2.sub(this, other);
  }

  mul(s: number): Vec2 {
    return Vec2.mul(this, s);
  }

  div(s: number): Vec2 {
    return Vec2.div(this, s);
  }

  dot(other: Vec2): number {
    return Vec2.dot(this, other);
  }

  cross(other: Vec2): number {
    return Vec2.cross(this, other);
  }

  lerp(other: Vec2, t: number): Vec2 {
    return Vec2.lerp(this, other, t);
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2 {
    const len = this.length;
    if (len === 0) return Vec2.ZERO;
    return this.div(len);
  }

  negate(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  equals(other: Vec2, epsilon = 1e-6): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }
}

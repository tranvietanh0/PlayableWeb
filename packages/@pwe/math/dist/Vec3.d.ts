export declare class Vec3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
    static readonly ZERO: Vec3;
    static readonly ONE: Vec3;
    static readonly UP: Vec3;
    static readonly RIGHT: Vec3;
    static readonly FORWARD: Vec3;
    static add(a: Vec3, b: Vec3): Vec3;
    static sub(a: Vec3, b: Vec3): Vec3;
    static mul(a: Vec3, s: number): Vec3;
    static div(a: Vec3, s: number): Vec3;
    static dot(a: Vec3, b: Vec3): number;
    static cross(a: Vec3, b: Vec3): Vec3;
    static lerp(a: Vec3, b: Vec3, t: number): Vec3;
    static distance(a: Vec3, b: Vec3): number;
    static distanceSquared(a: Vec3, b: Vec3): number;
    static fromArray(arr: readonly number[]): Vec3;
    add(other: Vec3): Vec3;
    sub(other: Vec3): Vec3;
    mul(s: number): Vec3;
    div(s: number): Vec3;
    dot(other: Vec3): number;
    cross(other: Vec3): Vec3;
    lerp(other: Vec3, t: number): Vec3;
    get length(): number;
    get lengthSquared(): number;
    normalize(): Vec3;
    negate(): Vec3;
    equals(other: Vec3, epsilon?: number): boolean;
    toArray(): [number, number, number];
    clone(): Vec3;
}
//# sourceMappingURL=Vec3.d.ts.map
export declare class Vec2 {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    static readonly ZERO: Vec2;
    static readonly ONE: Vec2;
    static readonly UP: Vec2;
    static readonly RIGHT: Vec2;
    static add(a: Vec2, b: Vec2): Vec2;
    static sub(a: Vec2, b: Vec2): Vec2;
    static mul(a: Vec2, s: number): Vec2;
    static div(a: Vec2, s: number): Vec2;
    static dot(a: Vec2, b: Vec2): number;
    static cross(a: Vec2, b: Vec2): number;
    static lerp(a: Vec2, b: Vec2, t: number): Vec2;
    static distance(a: Vec2, b: Vec2): number;
    static distanceSquared(a: Vec2, b: Vec2): number;
    static fromArray(arr: readonly number[]): Vec2;
    add(other: Vec2): Vec2;
    sub(other: Vec2): Vec2;
    mul(s: number): Vec2;
    div(s: number): Vec2;
    dot(other: Vec2): number;
    cross(other: Vec2): number;
    lerp(other: Vec2, t: number): Vec2;
    get length(): number;
    get lengthSquared(): number;
    normalize(): Vec2;
    negate(): Vec2;
    equals(other: Vec2, epsilon?: number): boolean;
    toArray(): [number, number];
    clone(): Vec2;
}
//# sourceMappingURL=Vec2.d.ts.map
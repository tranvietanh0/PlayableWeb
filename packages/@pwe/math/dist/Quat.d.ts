import { Vec3 } from './Vec3.js';
export declare class Quat {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
    constructor(x: number, y: number, z: number, w: number);
    static readonly IDENTITY: Quat;
    static fromAxisAngle(axis: Vec3, angle: number): Quat;
    static fromEuler(x: number, y: number, z: number): Quat;
    static multiply(a: Quat, b: Quat): Quat;
    static conjugate(q: Quat): Quat;
    static inverse(q: Quat): Quat;
    static slerp(a: Quat, b: Quat, t: number): Quat;
    static fromArray(arr: readonly number[]): Quat;
    multiply(other: Quat): Quat;
    conjugate(): Quat;
    inverse(): Quat;
    slerp(other: Quat, t: number): Quat;
    get length(): number;
    normalize(): Quat;
    rotateVector(v: Vec3): Vec3;
    equals(other: Quat, epsilon?: number): boolean;
    toArray(): [number, number, number, number];
    clone(): Quat;
}
//# sourceMappingURL=Quat.d.ts.map
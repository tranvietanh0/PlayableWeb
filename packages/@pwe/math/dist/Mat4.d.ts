import { Vec3 } from './Vec3.js';
import { Quat } from './Quat.js';
export declare class Mat4 {
    readonly m: readonly number[];
    constructor(m: readonly number[]);
    static readonly IDENTITY: Mat4;
    static fromTranslation(v: Vec3): Mat4;
    static fromScale(v: Vec3): Mat4;
    static fromRotation(q: Quat): Mat4;
    static fromTRS(translation: Vec3, rotation: Quat, scale: Vec3): Mat4;
    static perspective(fovRadians: number, aspect: number, near: number, far: number): Mat4;
    static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
    static lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4;
    multiply(other: Mat4): Mat4;
    transpose(): Mat4;
    inverse(): Mat4;
    transformPoint(v: Vec3): Vec3;
    transformVector(v: Vec3): Vec3;
    get translation(): Vec3;
    equals(other: Mat4, epsilon?: number): boolean;
    toArray(): number[];
    clone(): Mat4;
}
//# sourceMappingURL=Mat4.d.ts.map
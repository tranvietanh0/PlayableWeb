import { Vec3 } from './Vec3.js';
export class Quat {
    x;
    y;
    z;
    w;
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static IDENTITY = new Quat(0, 0, 0, 1);
    static fromAxisAngle(axis, angle) {
        const half = angle * 0.5;
        const s = Math.sin(half);
        const c = Math.cos(half);
        const n = axis.normalize();
        return new Quat(n.x * s, n.y * s, n.z * s, c);
    }
    static fromEuler(x, y, z) {
        const cx = Math.cos(x * 0.5);
        const sx = Math.sin(x * 0.5);
        const cy = Math.cos(y * 0.5);
        const sy = Math.sin(y * 0.5);
        const cz = Math.cos(z * 0.5);
        const sz = Math.sin(z * 0.5);
        return new Quat(sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz);
    }
    static multiply(a, b) {
        return new Quat(a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y, a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x, a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w, a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z);
    }
    static conjugate(q) {
        return new Quat(-q.x, -q.y, -q.z, q.w);
    }
    static inverse(q) {
        const normSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
        if (normSq === 0)
            return Quat.IDENTITY;
        const inv = 1 / normSq;
        return new Quat(-q.x * inv, -q.y * inv, -q.z * inv, q.w * inv);
    }
    static slerp(a, b, t) {
        let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        let target = b;
        if (dot < 0) {
            dot = -dot;
            target = new Quat(-b.x, -b.y, -b.z, -b.w);
        }
        if (dot > 0.9995) {
            const result = new Quat(a.x + (target.x - a.x) * t, a.y + (target.y - a.y) * t, a.z + (target.z - a.z) * t, a.w + (target.w - a.w) * t);
            return result.normalize();
        }
        const theta0 = Math.acos(dot);
        const theta = theta0 * t;
        const sinTheta = Math.sin(theta);
        const sinTheta0 = Math.sin(theta0);
        const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
        const s1 = sinTheta / sinTheta0;
        return new Quat(a.x * s0 + target.x * s1, a.y * s0 + target.y * s1, a.z * s0 + target.z * s1, a.w * s0 + target.w * s1);
    }
    static fromArray(arr) {
        if (arr.length < 4)
            throw new Error('Array must have at least 4 elements');
        return new Quat(arr[0], arr[1], arr[2], arr[3]);
    }
    multiply(other) {
        return Quat.multiply(this, other);
    }
    conjugate() {
        return Quat.conjugate(this);
    }
    inverse() {
        return Quat.inverse(this);
    }
    slerp(other, t) {
        return Quat.slerp(this, other, t);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    normalize() {
        const len = this.length;
        if (len === 0)
            return Quat.IDENTITY;
        return new Quat(this.x / len, this.y / len, this.z / len, this.w / len);
    }
    rotateVector(v) {
        const qv = new Quat(v.x, v.y, v.z, 0);
        const result = this.multiply(qv).multiply(this.inverse());
        return new Vec3(result.x, result.y, result.z);
    }
    equals(other, epsilon = 1e-6) {
        return (Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon &&
            Math.abs(this.w - other.w) < epsilon);
    }
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }
    clone() {
        return new Quat(this.x, this.y, this.z, this.w);
    }
}
//# sourceMappingURL=Quat.js.map
import { describe, it, expect } from 'vitest';
import { Quat } from '../Quat.js';
import { Vec3 } from '../Vec3.js';
describe('Quat', () => {
    it('constructs with x, y, z, w', () => {
        const q = new Quat(1, 2, 3, 4);
        expect(q.x).toBe(1);
        expect(q.y).toBe(2);
        expect(q.z).toBe(3);
        expect(q.w).toBe(4);
    });
    it('identity quaternion', () => {
        expect(Quat.IDENTITY.equals(new Quat(0, 0, 0, 1))).toBe(true);
    });
    it('multiplies two quaternions', () => {
        const a = new Quat(0, 0, 0, 1);
        const b = new Quat(0, 1, 0, 0);
        const result = a.multiply(b);
        expect(result.equals(b)).toBe(true);
    });
    it('conjugate', () => {
        const q = new Quat(1, 2, 3, 4);
        expect(q.conjugate().equals(new Quat(-1, -2, -3, 4))).toBe(true);
    });
    it('inverse of identity is identity', () => {
        expect(Quat.IDENTITY.inverse().equals(Quat.IDENTITY)).toBe(true);
    });
    it('inverse times original equals identity', () => {
        const q = new Quat(1, 2, 3, 4).normalize();
        const inv = q.inverse();
        const result = q.multiply(inv);
        expect(result.equals(Quat.IDENTITY)).toBe(true);
    });
    it('normalizes quaternion', () => {
        const q = new Quat(1, 2, 3, 4).normalize();
        expect(q.length).toBeCloseTo(1, 6);
    });
    it('normalizes zero quaternion to identity', () => {
        expect(new Quat(0, 0, 0, 0).normalize().equals(Quat.IDENTITY)).toBe(true);
    });
    it('slerps between quaternions', () => {
        const a = Quat.IDENTITY;
        const b = Quat.fromAxisAngle(Vec3.UP, Math.PI / 2);
        const mid = a.slerp(b, 0.5);
        expect(mid.length).toBeCloseTo(1, 6);
    });
    it('slerp at t=0 returns a', () => {
        const a = Quat.fromAxisAngle(Vec3.UP, 0);
        const b = Quat.fromAxisAngle(Vec3.UP, Math.PI);
        expect(a.slerp(b, 0).equals(a)).toBe(true);
    });
    it('slerp at t=1 returns b', () => {
        const a = Quat.fromAxisAngle(Vec3.UP, 0);
        const b = Quat.fromAxisAngle(Vec3.UP, Math.PI);
        const result = a.slerp(b, 1);
        expect(result.equals(b)).toBe(true);
    });
    it('rotates a vector', () => {
        const q = Quat.fromAxisAngle(Vec3.UP, Math.PI / 2);
        const v = new Vec3(1, 0, 0);
        const rotated = q.rotateVector(v);
        expect(rotated.x).toBeCloseTo(0, 5);
        expect(rotated.z).toBeCloseTo(-1, 5);
    });
    it('creates from axis-angle', () => {
        const q = Quat.fromAxisAngle(Vec3.UP, Math.PI);
        expect(q.length).toBeCloseTo(1, 6);
    });
    it('creates from euler angles', () => {
        const q = Quat.fromEuler(0, Math.PI / 2, 0);
        expect(q.length).toBeCloseTo(1, 6);
    });
    it('converts to array', () => {
        expect(new Quat(1, 2, 3, 4).toArray()).toEqual([1, 2, 3, 4]);
    });
    it('creates from array', () => {
        expect(Quat.fromArray([1, 2, 3, 4]).equals(new Quat(1, 2, 3, 4))).toBe(true);
    });
    it('throws fromArray with short array', () => {
        expect(() => Quat.fromArray([1, 2, 3])).toThrow();
    });
    it('clones quaternion', () => {
        const q = new Quat(1, 2, 3, 4);
        const c = q.clone();
        expect(c.equals(q)).toBe(true);
        expect(c).not.toBe(q);
    });
});
//# sourceMappingURL=Quat.test.js.map
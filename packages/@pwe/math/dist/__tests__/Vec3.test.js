import { describe, it, expect } from 'vitest';
import { Vec3 } from '../Vec3.js';
describe('Vec3', () => {
    it('constructs with x, y, z', () => {
        const v = new Vec3(1, 2, 3);
        expect(v.x).toBe(1);
        expect(v.y).toBe(2);
        expect(v.z).toBe(3);
    });
    it('adds two vectors', () => {
        const a = new Vec3(1, 2, 3);
        const b = new Vec3(4, 5, 6);
        expect(a.add(b).equals(new Vec3(5, 7, 9))).toBe(true);
    });
    it('subtracts two vectors', () => {
        const a = new Vec3(4, 5, 6);
        const b = new Vec3(1, 2, 3);
        expect(a.sub(b).equals(new Vec3(3, 3, 3))).toBe(true);
    });
    it('multiplies by scalar', () => {
        const v = new Vec3(1, 2, 3);
        expect(v.mul(2).equals(new Vec3(2, 4, 6))).toBe(true);
    });
    it('divides by scalar', () => {
        const v = new Vec3(2, 4, 6);
        expect(v.div(2).equals(new Vec3(1, 2, 3))).toBe(true);
    });
    it('computes dot product', () => {
        const a = new Vec3(1, 2, 3);
        const b = new Vec3(4, 5, 6);
        expect(a.dot(b)).toBe(32);
    });
    it('computes cross product', () => {
        const a = new Vec3(1, 0, 0);
        const b = new Vec3(0, 1, 0);
        expect(a.cross(b).equals(new Vec3(0, 0, 1))).toBe(true);
    });
    it('lerps between vectors', () => {
        const a = new Vec3(0, 0, 0);
        const b = new Vec3(10, 20, 30);
        expect(a.lerp(b, 0.5).equals(new Vec3(5, 10, 15))).toBe(true);
    });
    it('computes length', () => {
        expect(new Vec3(1, 2, 2).length).toBe(3);
    });
    it('computes length squared', () => {
        expect(new Vec3(1, 2, 2).lengthSquared).toBe(9);
    });
    it('normalizes vector', () => {
        const n = new Vec3(1, 2, 2).normalize();
        expect(n.length).toBeCloseTo(1, 6);
    });
    it('normalizes zero vector to ZERO', () => {
        expect(Vec3.ZERO.normalize().equals(Vec3.ZERO)).toBe(true);
    });
    it('negates vector', () => {
        const v = new Vec3(1, -2, 3);
        expect(v.negate().equals(new Vec3(-1, 2, -3))).toBe(true);
    });
    it('computes distance', () => {
        const a = new Vec3(0, 0, 0);
        const b = new Vec3(1, 2, 2);
        expect(Vec3.distance(a, b)).toBe(3);
    });
    it('computes distance squared', () => {
        const a = new Vec3(1, 1, 1);
        const b = new Vec3(4, 5, 5);
        expect(Vec3.distanceSquared(a, b)).toBe(41);
    });
    it('converts to array', () => {
        expect(new Vec3(1, 2, 3).toArray()).toEqual([1, 2, 3]);
    });
    it('creates from array', () => {
        expect(Vec3.fromArray([3, 4, 5]).equals(new Vec3(3, 4, 5))).toBe(true);
    });
    it('throws fromArray with short array', () => {
        expect(() => Vec3.fromArray([1, 2])).toThrow();
    });
    it('clones vector', () => {
        const v = new Vec3(1, 2, 3);
        const c = v.clone();
        expect(c.equals(v)).toBe(true);
        expect(c).not.toBe(v);
    });
    it('has correct constants', () => {
        expect(Vec3.ZERO.equals(new Vec3(0, 0, 0))).toBe(true);
        expect(Vec3.ONE.equals(new Vec3(1, 1, 1))).toBe(true);
        expect(Vec3.UP.equals(new Vec3(0, 1, 0))).toBe(true);
        expect(Vec3.RIGHT.equals(new Vec3(1, 0, 0))).toBe(true);
        expect(Vec3.FORWARD.equals(new Vec3(0, 0, 1))).toBe(true);
    });
});
//# sourceMappingURL=Vec3.test.js.map
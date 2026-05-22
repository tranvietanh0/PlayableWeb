import { describe, it, expect } from 'vitest';
import { Vec2 } from '../Vec2.js';
describe('Vec2', () => {
    it('constructs with x and y', () => {
        const v = new Vec2(1, 2);
        expect(v.x).toBe(1);
        expect(v.y).toBe(2);
    });
    it('adds two vectors', () => {
        const a = new Vec2(1, 2);
        const b = new Vec2(3, 4);
        expect(a.add(b).equals(new Vec2(4, 6))).toBe(true);
    });
    it('subtracts two vectors', () => {
        const a = new Vec2(3, 4);
        const b = new Vec2(1, 2);
        expect(a.sub(b).equals(new Vec2(2, 2))).toBe(true);
    });
    it('multiplies by scalar', () => {
        const v = new Vec2(1, 2);
        expect(v.mul(2).equals(new Vec2(2, 4))).toBe(true);
    });
    it('divides by scalar', () => {
        const v = new Vec2(4, 6);
        expect(v.div(2).equals(new Vec2(2, 3))).toBe(true);
    });
    it('computes dot product', () => {
        const a = new Vec2(1, 2);
        const b = new Vec2(3, 4);
        expect(a.dot(b)).toBe(11);
    });
    it('computes cross product (scalar)', () => {
        const a = new Vec2(1, 0);
        const b = new Vec2(0, 1);
        expect(a.cross(b)).toBe(1);
    });
    it('lerps between vectors', () => {
        const a = new Vec2(0, 0);
        const b = new Vec2(10, 20);
        expect(a.lerp(b, 0.5).equals(new Vec2(5, 10))).toBe(true);
    });
    it('computes length', () => {
        expect(new Vec2(3, 4).length).toBe(5);
    });
    it('computes length squared', () => {
        expect(new Vec2(3, 4).lengthSquared).toBe(25);
    });
    it('normalizes vector', () => {
        const n = new Vec2(3, 4).normalize();
        expect(n.length).toBeCloseTo(1, 6);
        expect(n.x).toBeCloseTo(0.6, 6);
        expect(n.y).toBeCloseTo(0.8, 6);
    });
    it('normalizes zero vector to ZERO', () => {
        expect(Vec2.ZERO.normalize().equals(Vec2.ZERO)).toBe(true);
    });
    it('negates vector', () => {
        const v = new Vec2(1, -2);
        expect(v.negate().equals(new Vec2(-1, 2))).toBe(true);
    });
    it('computes distance', () => {
        const a = new Vec2(0, 0);
        const b = new Vec2(3, 4);
        expect(Vec2.distance(a, b)).toBe(5);
    });
    it('computes distance squared', () => {
        const a = new Vec2(1, 1);
        const b = new Vec2(4, 5);
        expect(Vec2.distanceSquared(a, b)).toBe(25);
    });
    it('converts to array', () => {
        expect(new Vec2(1, 2).toArray()).toEqual([1, 2]);
    });
    it('creates from array', () => {
        expect(Vec2.fromArray([3, 4]).equals(new Vec2(3, 4))).toBe(true);
    });
    it('throws fromArray with short array', () => {
        expect(() => Vec2.fromArray([1])).toThrow();
    });
    it('clones vector', () => {
        const v = new Vec2(1, 2);
        const c = v.clone();
        expect(c.equals(v)).toBe(true);
        expect(c).not.toBe(v);
    });
    it('uses static methods', () => {
        expect(Vec2.add(new Vec2(1, 1), new Vec2(2, 2)).equals(new Vec2(3, 3))).toBe(true);
        expect(Vec2.sub(new Vec2(3, 3), new Vec2(1, 1)).equals(new Vec2(2, 2))).toBe(true);
        expect(Vec2.mul(new Vec2(1, 2), 3).equals(new Vec2(3, 6))).toBe(true);
        expect(Vec2.div(new Vec2(4, 6), 2).equals(new Vec2(2, 3))).toBe(true);
        expect(Vec2.dot(new Vec2(1, 2), new Vec2(3, 4))).toBe(11);
        expect(Vec2.cross(new Vec2(1, 0), new Vec2(0, 1))).toBe(1);
        expect(Vec2.lerp(new Vec2(0, 0), new Vec2(10, 20), 0.5).equals(new Vec2(5, 10))).toBe(true);
    });
    it('has correct constants', () => {
        expect(Vec2.ZERO.equals(new Vec2(0, 0))).toBe(true);
        expect(Vec2.ONE.equals(new Vec2(1, 1))).toBe(true);
        expect(Vec2.UP.equals(new Vec2(0, 1))).toBe(true);
        expect(Vec2.RIGHT.equals(new Vec2(1, 0))).toBe(true);
    });
});
//# sourceMappingURL=Vec2.test.js.map
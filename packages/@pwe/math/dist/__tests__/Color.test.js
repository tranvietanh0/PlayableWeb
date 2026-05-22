import { describe, it, expect } from 'vitest';
import { Color } from '../Color.js';
describe('Color', () => {
    it('constructs with r, g, b, a', () => {
        const c = new Color(0.1, 0.2, 0.3, 0.4);
        expect(c.r).toBeCloseTo(0.1, 6);
        expect(c.g).toBeCloseTo(0.2, 6);
        expect(c.b).toBeCloseTo(0.3, 6);
        expect(c.a).toBeCloseTo(0.4, 6);
    });
    it('defaults alpha to 1', () => {
        const c = new Color(0.1, 0.2, 0.3);
        expect(c.a).toBe(1);
    });
    it('creates from hex number', () => {
        const c = Color.fromHex(0xff0000);
        expect(c.equals(Color.RED)).toBe(true);
    });
    it('creates from hex string', () => {
        const c = Color.fromHexString('#00ff00');
        expect(c.equals(Color.GREEN)).toBe(true);
    });
    it('creates from hex string with alpha', () => {
        const c = Color.fromHexString('#ff000080');
        expect(c.a).toBeCloseTo(0.502, 2);
    });
    it('throws on invalid hex string length', () => {
        expect(() => Color.fromHexString('#fff')).toThrow();
    });
    it('lerps between colors', () => {
        const a = Color.BLACK;
        const b = Color.WHITE;
        const mid = a.lerp(b, 0.5);
        expect(mid.r).toBeCloseTo(0.5, 6);
        expect(mid.g).toBeCloseTo(0.5, 6);
        expect(mid.b).toBeCloseTo(0.5, 6);
    });
    it('multiplies colors', () => {
        const a = new Color(0.5, 0.5, 0.5);
        const b = new Color(0.5, 0.5, 0.5);
        const result = a.multiply(b);
        expect(result.r).toBeCloseTo(0.25, 6);
    });
    it('converts to hex', () => {
        expect(Color.RED.toHex()).toBe(0xff0000);
        expect(Color.GREEN.toHex()).toBe(0x00ff00);
        expect(Color.BLUE.toHex()).toBe(0x0000ff);
    });
    it('converts to hex string', () => {
        expect(Color.RED.toHexString()).toBe('#ff0000');
        expect(Color.RED.toHexString(true)).toBe('#ff0000ff');
    });
    it('converts to RGBA array', () => {
        expect(Color.RED.toRGBA()).toEqual([1, 0, 0, 1]);
    });
    it('converts to array', () => {
        expect(Color.RED.toArray()).toEqual([1, 0, 0, 1]);
    });
    it('creates from array', () => {
        const c = Color.fromArray([0.1, 0.2, 0.3]);
        expect(c.equals(new Color(0.1, 0.2, 0.3, 1))).toBe(true);
    });
    it('creates from array with alpha', () => {
        const c = Color.fromArray([0.1, 0.2, 0.3, 0.4]);
        expect(c.equals(new Color(0.1, 0.2, 0.3, 0.4))).toBe(true);
    });
    it('throws fromArray with short array', () => {
        expect(() => Color.fromArray([1, 2])).toThrow();
    });
    it('clones color', () => {
        const c = new Color(0.1, 0.2, 0.3, 0.4);
        const clone = c.clone();
        expect(clone.equals(c)).toBe(true);
        expect(clone).not.toBe(c);
    });
    it('has correct constants', () => {
        expect(Color.WHITE.equals(new Color(1, 1, 1, 1))).toBe(true);
        expect(Color.BLACK.equals(new Color(0, 0, 0, 1))).toBe(true);
        expect(Color.RED.equals(new Color(1, 0, 0, 1))).toBe(true);
        expect(Color.GREEN.equals(new Color(0, 1, 0, 1))).toBe(true);
        expect(Color.BLUE.equals(new Color(0, 0, 1, 1))).toBe(true);
        expect(Color.TRANSPARENT.equals(new Color(0, 0, 0, 0))).toBe(true);
    });
});
//# sourceMappingURL=Color.test.js.map
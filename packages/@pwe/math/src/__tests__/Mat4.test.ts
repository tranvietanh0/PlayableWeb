import { describe, it, expect } from 'vitest';
import { Mat4 } from '../Mat4.js';
import { Vec3 } from '../Vec3.js';
import { Quat } from '../Quat.js';

describe('Mat4', () => {
  it('constructs with 16 elements', () => {
    const m = new Mat4(Array.from({ length: 16 }, (_, i) => i));
    expect(m.m.length).toBe(16);
  });

  it('throws with wrong element count', () => {
    expect(() => new Mat4([1, 2, 3])).toThrow();
  });

  it('identity matrix', () => {
    expect(Mat4.IDENTITY.equals(new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]))).toBe(true);
  });

  it('multiplies by identity', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    expect(m.multiply(Mat4.IDENTITY).equals(m)).toBe(true);
    expect(Mat4.IDENTITY.multiply(m).equals(m)).toBe(true);
  });

  it('translation matrix', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    expect(m.translation.equals(new Vec3(1, 2, 3))).toBe(true);
  });

  it('scale matrix', () => {
    const m = Mat4.fromScale(new Vec3(2, 3, 4));
    const v = new Vec3(1, 1, 1);
    expect(m.transformVector(v).equals(new Vec3(2, 3, 4))).toBe(true);
  });

  it('rotation matrix from quaternion', () => {
    const q = Quat.fromAxisAngle(Vec3.UP, Math.PI / 2);
    const m = Mat4.fromRotation(q);
    const v = new Vec3(1, 0, 0);
    const rotated = m.transformVector(v);
    expect(rotated.x).toBeCloseTo(0, 5);
    expect(rotated.z).toBeCloseTo(-1, 5);
  });

  it('TRS matrix', () => {
    const m = Mat4.fromTRS(
      new Vec3(1, 2, 3),
      Quat.IDENTITY,
      new Vec3(1, 1, 1)
    );
    expect(m.translation.equals(new Vec3(1, 2, 3))).toBe(true);
  });

  it('transpose', () => {
    const m = new Mat4([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);
    const t = m.transpose();
    expect(t.m[1]).toBe(5);
    expect(t.m[4]).toBe(2);
  });

  it('inverse of identity is identity', () => {
    expect(Mat4.IDENTITY.inverse().equals(Mat4.IDENTITY)).toBe(true);
  });

  it('inverse times original equals identity', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    const inv = m.inverse();
    const result = m.multiply(inv);
    expect(result.equals(Mat4.IDENTITY)).toBe(true);
  });

  it('perspective matrix', () => {
    const m = Mat4.perspective(Math.PI / 4, 16 / 9, 0.1, 100);
    expect(m.m.length).toBe(16);
  });

  it('ortho matrix', () => {
    const m = Mat4.ortho(-1, 1, -1, 1, 0.1, 100);
    const v = new Vec3(0, 0, 0);
    const t = m.transformPoint(v);
    expect(t.x).toBeCloseTo(0, 5);
    expect(t.y).toBeCloseTo(0, 5);
  });

  it('lookAt matrix', () => {
    const m = Mat4.lookAt(
      new Vec3(0, 0, 5),
      Vec3.ZERO,
      Vec3.UP
    );
    const forward = m.transformVector(new Vec3(0, 0, -1));
    expect(forward.z).toBeCloseTo(-1, 5);
  });

  it('transforms point', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    const p = new Vec3(0, 0, 0);
    expect(m.transformPoint(p).equals(new Vec3(1, 2, 3))).toBe(true);
  });

  it('transforms vector (no translation)', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    const v = new Vec3(1, 1, 1);
    expect(m.transformVector(v).equals(new Vec3(1, 1, 1))).toBe(true);
  });

  it('converts to array', () => {
    const arr = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    expect(new Mat4(arr).toArray()).toEqual(arr);
  });

  it('clones matrix', () => {
    const m = Mat4.fromTranslation(new Vec3(1, 2, 3));
    const c = m.clone();
    expect(c.equals(m)).toBe(true);
    expect(c).not.toBe(m);
  });
});

import { describe, it, expect } from 'vitest';
import { ParticleSystem } from '../index.js';

describe('ParticleSystem', () => {
  it('spawns particles', () => {
    const ps = new ParticleSystem({ maxCount: 10 });
    ps.spawn({ x: 0, y: 0, count: 5 });
    expect(ps.activeCount).toBe(5);
  });

  it('updates particle positions', () => {
    const ps = new ParticleSystem({ maxCount: 10 });
    ps.spawn({ x: 0, y: 0, count: 1, speedMin: 100, speedMax: 100, angleMin: 0, angleMax: 0 });
    const before = ps.getActive()[0]!.x;
    ps.update(16);
    const after = ps.getActive()[0]!.x;
    expect(after).toBeGreaterThan(before);
  });

  it('applies gravity', () => {
    const ps = new ParticleSystem({ maxCount: 10, gravity: { x: 0, y: 100 } });
    ps.spawn({ x: 0, y: 0, count: 1, speedMin: 0, speedMax: 0, lifeMin: 2000, lifeMax: 2000 });
    ps.update(1000);
    const p = ps.getActive()[0]!;
    expect(p.vy).toBeGreaterThan(0);
    expect(p.y).toBeGreaterThan(0);
  });

  it('kills particles when life reaches zero', () => {
    const ps = new ParticleSystem({ maxCount: 10 });
    ps.spawn({ x: 0, y: 0, count: 1, lifeMin: 50, lifeMax: 50 });
    expect(ps.activeCount).toBe(1);
    ps.update(100);
    expect(ps.activeCount).toBe(0);
  });

  it('respects max count', () => {
    const ps = new ParticleSystem({ maxCount: 5 });
    ps.spawn({ x: 0, y: 0, count: 10 });
    expect(ps.activeCount).toBe(5);
  });

  it('clears all particles', () => {
    const ps = new ParticleSystem({ maxCount: 10 });
    ps.spawn({ x: 0, y: 0, count: 5 });
    ps.clear();
    expect(ps.activeCount).toBe(0);
  });
});

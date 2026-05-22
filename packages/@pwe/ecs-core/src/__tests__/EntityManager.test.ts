import { describe, it, expect, beforeEach } from 'vitest';
import { EntityManager } from '../EntityManager.js';

describe('EntityManager', () => {
  let em: EntityManager;

  beforeEach(() => {
    em = new EntityManager();
  });

  it('should create entities with unique IDs', () => {
    const e1 = em.create();
    const e2 = em.create();
    expect(e1).not.toBe(e2);
    expect(em.aliveCount).toBe(2);
  });

  it('should report isAlive correctly', () => {
    const e = em.create();
    expect(em.isAlive(e)).toBe(true);
    em.destroy(e);
    expect(em.isAlive(e)).toBe(false);
  });

  it('should recycle entity IDs via free list', () => {
    const e1 = em.create();
    const index1 = e1 & ((1 << 20) - 1);
    em.destroy(e1);
    const e2 = em.create();
    const index2 = e2 & ((1 << 20) - 1);
    expect(index1).toBe(index2);
    expect(e1).not.toBe(e2); // generation bumped
  });

  it('should handle 1000 create/destroy cycles', () => {
    const entities: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const e = em.create();
      entities.push(e);
    }
    expect(em.aliveCount).toBe(1000);

    // Check all are alive before destroying any
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]!;
      if (!em.isAlive(e)) {
        const idx = e & ((1 << 20) - 1);
        const gen = (e >>> 20) & 0xfff;
        throw new Error(`entity not alive after creation loop at i=${i} entity=${e} index=${idx} gen=${gen}`);
      }
    }

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]!;
      const ok = em.destroy(e);
      if (!ok) {
        const idx = e & ((1 << 20) - 1);
        const gen = (e >>> 20) & 0xfff;
        throw new Error(`destroy failed at i=${i} entity=${e} index=${idx} gen=${gen}`);
      }
    }
    expect(em.aliveCount).toBe(0);
    expect(em.isEmpty).toBe(true);
  });

  it('should not destroy an already destroyed entity', () => {
    const e = em.create();
    expect(em.destroy(e)).toBe(true);
    expect(em.destroy(e)).toBe(false);
  });

  it('should return all alive entities', () => {
    const e1 = em.create();
    const e2 = em.create();
    em.create();
    em.destroy(e2);
    const alive = em.getAllAlive();
    expect(alive).toContain(e1);
    expect(alive).not.toContain(e2);
    expect(alive.length).toBe(2);
  });

  it('should clear all entities', () => {
    for (let i = 0; i < 10; i++) em.create();
    em.clear();
    expect(em.aliveCount).toBe(0);
    expect(em.isEmpty).toBe(true);
  });
});

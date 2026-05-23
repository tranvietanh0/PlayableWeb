import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TweenEngine, Easing } from '../TweenEngine.js';

describe('TweenEngine', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  it('tweens from 0 to 10 linearly', () => {
    const engine = new TweenEngine();
    const values: number[] = [];
    engine.tween(0, 10, {
      duration: 100,
      onUpdate: (v) => values.push(v),
    });

    engine.update(0);
    expect(values[0]).toBe(0);

    now = 50;
    engine.update(50);
    expect(values[values.length - 1]).toBeCloseTo(5, 1);

    now = 100;
    engine.update(50);
    expect(values[values.length - 1]).toBe(10);
  });

  it('calls onComplete when finished', () => {
    const engine = new TweenEngine();
    let completed = false;
    engine.tween(0, 1, {
      duration: 100,
      onComplete: () => { completed = true; },
    });

    now = 100;
    engine.update(100);
    expect(completed).toBe(true);
  });

  it('supports yoyo', () => {
    const engine = new TweenEngine();
    const values: number[] = [];
    engine.tween(0, 10, {
      duration: 100,
      yoyo: true,
      repeat: 1,
      onUpdate: (v) => values.push(v),
    });

    now = 100;
    engine.update(100);
    expect(values[values.length - 1]).toBe(10);

    now = 200;
    engine.update(100);
    expect(values[values.length - 1]).toBe(0);
  });

  it('supports repeat without yoyo', () => {
    const engine = new TweenEngine();
    let count = 0;
    engine.tween(0, 1, {
      duration: 100,
      repeat: 2,
      onComplete: () => { count++; },
    });

    now = 100;
    engine.update(100);
    expect(engine.activeCount).toBe(1); // still active after first repeat

    now = 200;
    engine.update(100);
    expect(engine.activeCount).toBe(1); // still active after second repeat

    now = 300;
    engine.update(100);
    expect(count).toBe(1);
    expect(engine.activeCount).toBe(0);
  });

  it('stops a tween', () => {
    const engine = new TweenEngine();
    const id = engine.tween(0, 1, { duration: 100 });
    engine.stop(id);
    expect(engine.activeCount).toBe(0);
  });

  it('stops all tweens', () => {
    const engine = new TweenEngine();
    engine.tween(0, 1, { duration: 100 });
    engine.tween(0, 1, { duration: 100 });
    engine.stopAll();
    expect(engine.activeCount).toBe(0);
  });
});

describe('Easing', () => {
  it('linear goes 0 -> 1', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });

  it('easeInQuad accelerates', () => {
    expect(Easing.easeInQuad(0)).toBe(0);
    expect(Easing.easeInQuad(0.5)).toBe(0.25);
    expect(Easing.easeInQuad(1)).toBe(1);
  });

  it('easeOutQuad decelerates', () => {
    expect(Easing.easeOutQuad(0)).toBe(0);
    expect(Easing.easeOutQuad(0.5)).toBe(0.75);
    expect(Easing.easeOutQuad(1)).toBe(1);
  });
});

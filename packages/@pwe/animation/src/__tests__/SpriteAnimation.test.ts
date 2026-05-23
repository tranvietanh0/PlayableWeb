import { describe, it, expect } from 'vitest';
import { SpriteAnimation } from '../index.js';

describe('SpriteAnimation', () => {
  it('advances frames over time', () => {
    const anim = new SpriteAnimation({
      frames: [0, 1, 2, 3],
      frameDuration: 100,
      loop: false,
    });

    expect(anim.currentIndex).toBe(0);
    anim.update(50);
    expect(anim.currentIndex).toBe(0);
    anim.update(60);
    expect(anim.currentIndex).toBe(1);
    anim.update(200);
    expect(anim.currentIndex).toBe(3);
    expect(anim.finished).toBe(false);
    anim.update(100);
    expect(anim.finished).toBe(true);
  });

  it('loops by default', () => {
    const anim = new SpriteAnimation({
      frames: [0, 1],
      frameDuration: 100,
    });

    anim.update(250);
    expect(anim.currentIndex).toBe(0);
    expect(anim.finished).toBe(false);
  });

  it('resets', () => {
    const anim = new SpriteAnimation({
      frames: [0, 1, 2],
      frameDuration: 100,
      loop: false,
    });

    anim.update(400);
    expect(anim.finished).toBe(true);
    anim.reset();
    expect(anim.currentIndex).toBe(0);
    expect(anim.finished).toBe(false);
  });

  it('handles empty frames', () => {
    const anim = new SpriteAnimation({
      frames: [],
      frameDuration: 100,
    });

    anim.update(100);
    expect(anim.currentIndex).toBe(0);
    expect(anim.finished).toBe(false);
  });
});

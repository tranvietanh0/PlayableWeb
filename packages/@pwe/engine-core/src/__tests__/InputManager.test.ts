import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../InputManager.js';

describe('InputManager', () => {
  let input: InputManager;
  let mockTarget: HTMLElement;

  beforeEach(() => {
    input = new InputManager();
    mockTarget = document.createElement('div');
    document.body.appendChild(mockTarget);
  });

  afterEach(() => {
    input.detach();
    document.body.removeChild(mockTarget);
  });

  it('should track key down and up', () => {
    input.attach(mockTarget);

    mockTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(input.isKeyDown('ArrowUp')).toBe(true);

    mockTarget.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', bubbles: true }));
    expect(input.isKeyDown('ArrowUp')).toBe(false);
  });

  it('should track mouse buttons', () => {
    input.attach(mockTarget);

    mockTarget.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
    expect(input.isMouseDown(0)).toBe(true);

    mockTarget.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    expect(input.isMouseDown(0)).toBe(false);
  });

  it('should track mouse position', () => {
    input.attach(mockTarget);

    mockTarget.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200, bubbles: true }));
    const state = input.state;
    expect(state.mouse.x).toBe(100);
    expect(state.mouse.y).toBe(200);
  });

  it('should reset frame deltas', () => {
    input.attach(mockTarget);

    mockTarget.dispatchEvent(new MouseEvent('mousemove', { movementX: 5, movementY: 10, bubbles: true }));
    expect(input.state.mouse.dx).toBe(5);
    expect(input.state.mouse.dy).toBe(10);

    input.resetFrame();
    expect(input.state.mouse.dx).toBe(0);
    expect(input.state.mouse.dy).toBe(0);
  });

  it('should clear all state', () => {
    input.attach(mockTarget);

    mockTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    mockTarget.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));

    input.clear();
    expect(input.isKeyDown('a')).toBe(false);
    expect(input.isMouseDown(0)).toBe(false);
  });

  it('should detach listeners safely', () => {
    input.attach(mockTarget);
    input.detach();

    // After detach, events should not be tracked
    mockTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(input.isKeyDown('x')).toBe(false);
  });

  it('should support touch events', () => {
    input.attach(mockTarget);

    const touch = {
      identifier: 1,
      target: mockTarget,
      clientX: 50,
      clientY: 60,
    } as Touch;

    mockTarget.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
    expect(input.state.touches.has(1)).toBe(true);
    expect(input.state.touches.get(1)).toEqual({ x: 50, y: 60 });

    mockTarget.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch], bubbles: true }));
    expect(input.state.touches.has(1)).toBe(false);
  });
});

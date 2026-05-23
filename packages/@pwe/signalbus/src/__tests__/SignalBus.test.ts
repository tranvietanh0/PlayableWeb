import { describe, it, expect, vi } from 'vitest';
import { SignalBus } from '../SignalBus.js';

describe('SignalBus', () => {
  it('should subscribe and emit', () => {
    const bus = new SignalBus();
    const handler = vi.fn();

    bus.subscribe('test', handler);
    bus.emit('test', 42);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(42, undefined);
  });

  it('should unsubscribe', () => {
    const bus = new SignalBus();
    const handler = vi.fn();

    const unsub = bus.subscribe('test', handler);
    unsub();
    bus.emit('test', 42);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support entity-specific subscriptions', () => {
    const bus = new SignalBus();
    const globalHandler = vi.fn();
    const entityHandler = vi.fn();

    bus.subscribe('hit', globalHandler);
    bus.subscribe('hit', entityHandler, { entity: 1 });

    bus.emit('hit', { damage: 10 }, 1);

    expect(globalHandler).toHaveBeenCalledTimes(1);
    expect(entityHandler).toHaveBeenCalledTimes(1);
    expect(entityHandler).toHaveBeenCalledWith({ damage: 10 }, 1);
  });

  it('should not call entity-specific handler for different entity', () => {
    const bus = new SignalBus();
    const handler = vi.fn();

    bus.subscribe('hit', handler, { entity: 1 });
    bus.emit('hit', { damage: 10 }, 2);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support once subscriptions', () => {
    const bus = new SignalBus();
    const handler = vi.fn();

    bus.subscribe('test', handler, { once: true });
    bus.emit('test', 1);
    bus.emit('test', 2);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1, undefined);
  });

  it('should isolate errors between handlers', () => {
    const bus = new SignalBus();
    const errorHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();

    bus.subscribe('test', errorHandler);
    bus.subscribe('test', goodHandler);

    // Should not throw
    expect(() => bus.emit('test', 42)).not.toThrow();

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it('should clear all subscriptions', () => {
    const bus = new SignalBus();
    const handler = vi.fn();

    bus.subscribe('a', handler);
    bus.subscribe('b', handler);
    bus.clear();
    bus.emit('a', 1);
    bus.emit('b', 2);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should clear entity-specific subscriptions', () => {
    const bus = new SignalBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const globalHandler = vi.fn();

    bus.subscribe('event', handler1, { entity: 1 });
    bus.subscribe('event', handler2, { entity: 2 });
    bus.subscribe('event', globalHandler);

    bus.clearEntity(1);

    bus.emit('event', 'x', 1);
    bus.emit('event', 'x', 2);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(globalHandler).toHaveBeenCalledTimes(2);
  });

  it('should support typed payloads', () => {
    const bus = new SignalBus();
    const handler = vi.fn((payload: { x: number; y: number }) => {
      expect(payload.x).toBe(1);
      expect(payload.y).toBe(2);
    });

    bus.subscribe('pos', handler);
    bus.emit('pos', { x: 1, y: 2 });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Engine } from '../Engine.js';

describe('Engine', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('should initialize in edit mode', () => {
    expect(engine.mode).toBe('edit');
    expect(engine.isPlaying).toBe(false);
  });

  it('should switch to play mode', () => {
    const playHandler = vi.fn();
    engine.signalBus.subscribe('engine:play', playHandler);

    engine.play();

    expect(engine.mode).toBe('play');
    expect(engine.isPlaying).toBe(true);
    expect(playHandler).toHaveBeenCalledTimes(1);
  });

  it('should pause and resume', () => {
    engine.play();
    expect(engine.isPlaying).toBe(true);

    const pauseHandler = vi.fn();
    engine.signalBus.subscribe('engine:pause', pauseHandler);

    engine.pause();
    expect(engine.isPlaying).toBe(false);
    expect(pauseHandler).toHaveBeenCalledTimes(1);

    engine.play();
    expect(engine.isPlaying).toBe(true);
  });

  it('should stop and return to edit mode', () => {
    engine.play();
    const stopHandler = vi.fn();
    engine.signalBus.subscribe('engine:stop', stopHandler);

    engine.stop();
    expect(engine.mode).toBe('edit');
    expect(engine.isPlaying).toBe(false);
    expect(stopHandler).toHaveBeenCalledTimes(1);
  });

  it('should run systems during manual step', () => {
    const updateFn = vi.fn();
    engine.world.addSystem({ name: 'test', update: updateFn });

    engine.play();
    engine.step(16.6);

    expect(updateFn).toHaveBeenCalled();
  });

  it('should call onUpdate and onRender callbacks', () => {
    const onUpdate = vi.fn();
    const onRender = vi.fn();

    engine.onUpdate = onUpdate;
    engine.onRender = onRender;

    engine.play();
    engine.step(16.6);

    expect(onUpdate).toHaveBeenCalledWith(16.6);
    expect(onRender).toHaveBeenCalledWith(16.6);
  });

  it('should not step when paused', () => {
    const updateFn = vi.fn();
    engine.world.addSystem({ name: 'test', update: updateFn });

    engine.pause();
    engine.step(16.6);

    expect(updateFn).not.toHaveBeenCalled();
  });

  it('should clear everything on destroy', () => {
    engine.play();
    engine.world.createEntity();
    engine.destroy();

    expect(engine.isPlaying).toBe(false);
    expect(engine.world.entityManager.isEmpty).toBe(true);
  });

  it('should auto-start when configured', () => {
    const autoEngine = new Engine({ autoStart: true });
    expect(autoEngine.isPlaying).toBe(true);
    autoEngine.destroy();
  });

  it('should expose world, signalBus, serializer, and input', () => {
    expect(engine.world).toBeDefined();
    expect(engine.signalBus).toBeDefined();
    expect(engine.serializer).toBeDefined();
    expect(engine.input).toBeDefined();
  });
});

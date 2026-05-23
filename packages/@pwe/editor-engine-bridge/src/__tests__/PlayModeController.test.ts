import { describe, it, expect, beforeEach } from 'vitest';
import { Engine } from '@pwe/engine-core';
import { PlayModeController } from '../PlayModeController.js';

class Position {
  constructor(public x = 0, public y = 0) {}
}

describe('PlayModeController', () => {
  let engine: Engine;
  let controller: PlayModeController;

  beforeEach(() => {
    engine = new Engine();
    controller = new PlayModeController(engine);
  });

  it('should capture snapshot on enter play mode', () => {
    const entity = engine.world.createEntity();
    engine.world.addComponent(entity, new Position(1, 2));

    controller.enterPlayMode();
    expect(controller.hasSnapshot).toBe(true);
    expect(engine.isPlaying).toBe(true);
  });

  it('should restore snapshot on exit play mode', () => {
    const entity = engine.world.createEntity();
    engine.world.addComponent(entity, new Position(1, 2));

    controller.enterPlayMode();
    // Simulate runtime change: add another entity
    engine.world.createEntity();
    expect(engine.world.entityManager.aliveCount).toBe(2);

    controller.exitPlayMode();
    expect(engine.isPlaying).toBe(false);
    expect(engine.world.entityManager.aliveCount).toBe(1);
  });

  it('should not enter play mode if already playing', () => {
    controller.enterPlayMode();
    const snapshot1 = (controller as unknown as { _snapshot: unknown })._snapshot;
    controller.enterPlayMode();
    const snapshot2 = (controller as unknown as { _snapshot: unknown })._snapshot;
    expect(snapshot1).toBe(snapshot2);
  });
});

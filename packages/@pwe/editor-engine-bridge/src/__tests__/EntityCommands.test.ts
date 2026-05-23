import { describe, it, expect, beforeEach } from 'vitest';
import { Engine } from '@pwe/engine-core';
import { CommandHistory, createEntity, destroyEntity, addComponent } from '../index.js';

class Velocity {
  constructor(public x = 0, public y = 0) {}
}

describe('EntityCommands', () => {
  let engine: Engine;
  let history: CommandHistory;

  beforeEach(() => {
    engine = new Engine();
    history = new CommandHistory();
  });

  it('should create entity via command', () => {
    const id = createEntity(engine, history);
    expect(id).not.toBeNull();
    expect(engine.world.isAlive(id!)).toBe(true);
  });

  it('should undo create entity', () => {
    const id = createEntity(engine, history);
    expect(engine.world.isAlive(id!)).toBe(true);

    history.undo();
    expect(engine.world.isAlive(id!)).toBe(false);
  });

  it('should destroy entity via command', () => {
    const id = engine.world.createEntity();
    expect(engine.world.isAlive(id)).toBe(true);

    destroyEntity(engine, history, id);
    expect(engine.world.isAlive(id)).toBe(false);
  });

  it('should undo destroy entity', () => {
    const id = engine.world.createEntity();
    engine.world.addComponent(id, new Velocity(1, 2));

    destroyEntity(engine, history, id);
    expect(engine.world.isAlive(id)).toBe(false);

    history.undo();
    // A new entity is created with the same components
    expect(engine.world.entityManager.aliveCount).toBe(1);
  });

  it('should add component via command', () => {
    const id = engine.world.createEntity();
    addComponent(engine, history, id, new Velocity(3, 4));
    expect(engine.world.hasComponent(id, Velocity)).toBe(true);

    history.undo();
    expect(engine.world.hasComponent(id, Velocity)).toBe(false);
  });
});

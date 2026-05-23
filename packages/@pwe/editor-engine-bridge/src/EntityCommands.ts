import { Engine } from '@pwe/engine-core';
import { Command, CommandHistory } from './CommandHistory.js';

export class CreateEntityCommand implements Command {
  label = 'Create Entity';
  private _engine: Engine;
  private _entityId: number | null = null;

  constructor(engine: Engine) {
    this._engine = engine;
  }

  execute(): void {
    this._entityId = this._engine.world.createEntity();
  }

  undo(): void {
    if (this._entityId !== null) {
      this._engine.world.destroyEntity(this._entityId);
      this._entityId = null;
    }
  }

  get createdEntityId(): number | null {
    return this._entityId;
  }
}

export class DestroyEntityCommand implements Command {
  label = 'Destroy Entity';
  private _engine: Engine;
  private _entityId: number;
  private _components: object[] = [];

  constructor(engine: Engine, entityId: number) {
    this._engine = engine;
    this._entityId = entityId;
  }

  execute(): void {
    this._components = this._engine.world.components.getAllComponents(this._entityId);
    this._engine.world.destroyEntity(this._entityId);
  }

  undo(): void {
    const newEntity = this._engine.world.createEntity();
    for (const comp of this._components) {
      this._engine.world.addComponent(newEntity, this._clone(comp));
    }
    // Note: entity ID may differ after undo; advanced impl would preserve IDs.
  }

  private _clone<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

export class AddComponentCommand implements Command {
  label = 'Add Component';
  private _engine: Engine;
  private _entityId: number;
  private _component: object;

  constructor(engine: Engine, entityId: number, component: object) {
    this._engine = engine;
    this._entityId = entityId;
    this._component = component;
  }

  execute(): void {
    this._engine.world.addComponent(this._entityId, this._component);
  }

  undo(): void {
    this._engine.world.removeComponent(this._entityId, this._component.constructor as new (...args: unknown[]) => object);
  }
}

export function createEntity(engine: Engine, history: CommandHistory): number | null {
  const cmd = new CreateEntityCommand(engine);
  history.push(cmd);
  return cmd.createdEntityId;
}

export function destroyEntity(engine: Engine, history: CommandHistory, entityId: number): void {
  history.push(new DestroyEntityCommand(engine, entityId));
}

export function addComponent(engine: Engine, history: CommandHistory, entityId: number, component: object): void {
  history.push(new AddComponentCommand(engine, entityId, component));
}

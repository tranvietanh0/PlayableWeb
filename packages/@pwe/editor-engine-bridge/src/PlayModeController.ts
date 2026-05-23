import { Engine } from '@pwe/engine-core';
import { SceneSerializer } from '@pwe/serialize';

export interface Snapshot {
  readonly entities: Array<{ id: number; components: object[] }>;
  readonly timestamp: number;
}

export class PlayModeController {
  private _engine: Engine;
  private _snapshot: Snapshot | null = null;
  private _serializer = new SceneSerializer();

  constructor(engine: Engine) {
    this._engine = engine;
    void this._serializer;
  }

  get hasSnapshot(): boolean {
    return this._snapshot !== null;
  }

  enterPlayMode(): void {
    if (this._engine.mode === 'play') return;

    // Capture pre-play snapshot
    this._snapshot = this._capture();
    this._engine.play();
  }

  exitPlayMode(): void {
    if (this._engine.mode !== 'play') return;

    this._engine.stop();

    // Restore pre-play snapshot if available
    if (this._snapshot) {
      this._restore(this._snapshot);
      this._snapshot = null;
    }
  }

  private _capture(): Snapshot {
    const world = this._engine.world;
    const entities: Array<{ id: number; components: object[] }> = [];

    // Iterate over all alive entities and collect their components
    const allEntities = world.entityManager.getAllEntities();
    for (const id of allEntities) {
      const comps = world.components.getAllComponents(id);
      entities.push({ id, components: comps.map((c: object) => this._cloneComponent(c)) });
    }

    return { entities, timestamp: performance.now() };
  }

  private _restore(snapshot: Snapshot): void {
    const world = this._engine.world;

    // Clear current world
    world.clear();

    // Recreate entities and components
    for (const entry of snapshot.entities) {
      const newEntity = world.createEntity();
      // If ECS doesn't guarantee same IDs, we just recreate; otherwise we'd map IDs.
      // Our simple ECS creates sequential IDs starting from 1 after clear.
      for (const comp of entry.components) {
        world.addComponent(newEntity, this._cloneComponent(comp));
      }
    }
  }

  private _cloneComponent<T extends object>(component: T): T {
    // Simple structured clone for plain objects
    return JSON.parse(JSON.stringify(component)) as T;
  }
}

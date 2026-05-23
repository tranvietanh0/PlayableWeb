import type { World, Entity, ComponentType } from '@pwe/ecs-core';
import { Vec2, Vec3, Quat, Mat4, Color } from '@pwe/math';

export interface SerializedComponent {
  type: string;
  data: Record<string, unknown>;
}

export interface SerializedEntity {
  id: number;
  components: SerializedComponent[];
}

export interface SerializedScene {
  version: number;
  entities: SerializedEntity[];
}

const SERIAL_VERSION = 1;

interface MathTypeCtor {
  new (...args: number[]): object;
}

const MATH_TYPES: Record<string, MathTypeCtor> = {
  Vec2: Vec2 as unknown as MathTypeCtor,
  Vec3: Vec3 as unknown as MathTypeCtor,
  Quat: Quat as unknown as MathTypeCtor,
  Mat4: Mat4 as unknown as MathTypeCtor,
  Color: Color as unknown as MathTypeCtor,
};

export class SceneSerializer {
  private _typeRegistry = new Map<string, ComponentType>();

  registerComponentType(name: string, ctor: ComponentType): void {
    this._typeRegistry.set(name, ctor);
  }

  unregisterComponentType(name: string): boolean {
    return this._typeRegistry.delete(name);
  }

  serialize(world: World): SerializedScene {
    const allEntities = world.entityManager.getAllAlive();
    const serializedEntities: SerializedEntity[] = [];

    for (const entity of allEntities) {
      const components: SerializedComponent[] = [];
      for (const [name, ctor] of this._typeRegistry) {
        const comp = world.getComponent(entity, ctor);
        if (comp) {
          components.push({
            type: name,
            data: this._serializeValue(comp) as Record<string, unknown>,
          });
        }
      }

      if (components.length > 0) {
        serializedEntities.push({ id: entity, components });
      }
    }

    return {
      version: SERIAL_VERSION,
      entities: serializedEntities,
    };
  }

  deserialize(world: World, scene: SerializedScene): Entity[] {
    if (scene.version !== SERIAL_VERSION) {
      throw new Error(`Unsupported scene version: ${scene.version}`);
    }

    const created: Entity[] = [];

    for (const serEntity of scene.entities) {
      let entity: Entity;
      if (!world.isAlive(serEntity.id)) {
        entity = world.createEntity();
      } else {
        entity = serEntity.id;
      }

      for (const serComp of serEntity.components) {
        const ctor = this._typeRegistry.get(serComp.type);
        if (!ctor) {
          console.warn(`Unknown component type "${serComp.type}" during deserialization — skipping`);
          continue;
        }

        const instance = this._deserializeValue(serComp.data, ctor);
        world.addComponent(entity, instance);
      }

      created.push(entity);
    }

    return created;
  }

  clone(world: World, entity: Entity): Entity | undefined {
    if (!world.isAlive(entity)) return undefined;

    const cloneEntity = world.createEntity();

    for (const [, ctor] of this._typeRegistry) {
      const comp = world.getComponent(entity, ctor);
      if (comp) {
        const serialized = this._serializeValue(comp);
        const cloned = this._deserializeValue(serialized, ctor);
        world.addComponent(cloneEntity, cloned);
      }
    }

    return cloneEntity;
  }

  private _serializeValue(value: unknown): unknown {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    const ctorName = (value as object).constructor.name;
    if (MATH_TYPES[ctorName]) {
      const result: Record<string, unknown> = { __type: ctorName };
      for (const key of Object.keys(value as object)) {
        result[key] = this._serializeValue((value as Record<string, unknown>)[key]);
      }
      return result;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this._serializeValue(item));
    }

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      const v = (value as Record<string, unknown>)[key];
      result[key] = this._serializeValue(v);
    }
    return result;
  }

  private _deserializeValue(value: unknown, ctor?: ComponentType): object {
    if (value === null || typeof value !== 'object') {
      throw new Error('Cannot deserialize primitive as component');
    }

    const obj = value as Record<string, unknown>;

    const typeKey = obj['__type'];
    if (typeKey && typeof typeKey === 'string' && MATH_TYPES[typeKey]) {
      const MathCtor = MATH_TYPES[typeKey]!;
      const args: number[] = [];
      if (typeKey === 'Vec2') {
        args.push((obj['x'] as number) ?? 0, (obj['y'] as number) ?? 0);
      } else if (typeKey === 'Vec3') {
        args.push((obj['x'] as number) ?? 0, (obj['y'] as number) ?? 0, (obj['z'] as number) ?? 0);
      } else if (typeKey === 'Quat') {
        args.push((obj['x'] as number) ?? 0, (obj['y'] as number) ?? 0, (obj['z'] as number) ?? 0, (obj['w'] as number) ?? 1);
      } else if (typeKey === 'Color') {
        args.push((obj['r'] as number) ?? 0, (obj['g'] as number) ?? 0, (obj['b'] as number) ?? 0, (obj['a'] as number) ?? 1);
      } else if (typeKey === 'Mat4') {
        const m = obj['m'] as number[] | undefined;
        if (m && m.length === 16) {
          args.push(...m);
        } else {
          args.push(...Mat4.IDENTITY.m);
        }
      }
      return new MathCtor(...args);
    }

    if (!ctor) {
      throw new Error('No constructor provided for deserialization');
    }

    const instance = Object.create(ctor.prototype);
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        const nestedObj = v as Record<string, unknown>;
        if (typeof nestedObj['__type'] === 'string' && MATH_TYPES[nestedObj['__type']]) {
          (instance as Record<string, unknown>)[key] = this._deserializeValue(v, undefined);
        } else {
          (instance as Record<string, unknown>)[key] = { ...(v as object) };
        }
      } else {
        (instance as Record<string, unknown>)[key] = v;
      }
    }
    return instance;
  }
}

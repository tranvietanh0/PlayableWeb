import type { Entity } from '@pwe/ecs-core';

export type SignalHandler<T = unknown> = (payload: T, entity?: Entity) => void;

interface Subscription<T = unknown> {
  id: number;
  handler: SignalHandler<T>;
  once: boolean;
}

interface Target {
  subs: Subscription[];
  entity: Entity | undefined;
}

export class SignalBus {
  private _channels = new Map<string, Map<number, Subscription[]>>();
  private _nextId = 0;

  subscribe<T>(
    channel: string,
    handler: SignalHandler<T>,
    options: { entity?: Entity; once?: boolean } = {}
  ): () => void {
    const id = this._nextId++;
    const key = options.entity ?? -1;
    const sub: Subscription<T> = {
      id,
      handler: handler as SignalHandler,
      once: options.once ?? false,
    };

    let entityMap = this._channels.get(channel);
    if (!entityMap) {
      entityMap = new Map<number, Subscription[]>();
      this._channels.set(channel, entityMap);
    }

    let subs = entityMap.get(key);
    if (!subs) {
      subs = [];
      entityMap.set(key, subs);
    }

    subs.push(sub as Subscription);

    return () => this._unsubscribe(channel, id, key);
  }

  private _unsubscribe(channel: string, id: number, entityKey: number): boolean {
    const entityMap = this._channels.get(channel);
    if (!entityMap) return false;

    const subs = entityMap.get(entityKey);
    if (!subs) return false;

    const idx = subs.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    subs.splice(idx, 1);

    if (subs.length === 0) {
      entityMap.delete(entityKey);
    }
    if (entityMap.size === 0) {
      this._channels.delete(channel);
    }

    return true;
  }

  emit<T>(channel: string, payload: T, entity?: Entity): void {
    const entityMap = this._channels.get(channel);
    if (!entityMap) return;

    const targets: Target[] = [];

    // Global listeners (key = -1)
    const globalSubs = entityMap.get(-1);
    if (globalSubs) {
      targets.push({ subs: globalSubs, entity: undefined });
    }

    // Entity-specific listeners
    if (entity !== undefined) {
      const entitySubs = entityMap.get(entity);
      if (entitySubs) {
        targets.push({ subs: entitySubs, entity });
      }
    }

    for (const target of targets) {
      const toRemove: number[] = [];
      for (let i = 0; i < target.subs.length; i++) {
        const sub = target.subs[i]!;
        try {
          sub.handler(payload, target.entity);
        } catch (err) {
          // Error isolation: do not let one handler break others
          console.error(`SignalBus error in channel "${channel}":`, err);
        }
        if (sub.once) {
          toRemove.push(i);
        }
      }
      // Remove once handlers in reverse order
      for (let i = toRemove.length - 1; i >= 0; i--) {
        target.subs.splice(toRemove[i]!, 1);
      }
    }
  }

  clear(): void {
    this._channels.clear();
    this._nextId = 0;
  }

  clearEntity(entity: Entity): void {
    for (const entityMap of this._channels.values()) {
      entityMap.delete(entity);
    }
  }
}

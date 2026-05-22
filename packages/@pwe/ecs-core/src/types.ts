/**
 * Entity is a lightweight uint32 handle.
 * Top 20 bits = index, bottom 12 bits = generation (for recycling validation).
 */
export type Entity = number;

/** Component constructor type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentType<T = object> = new (...args: any[]) => T;

/** System update function signature */
export type SystemUpdateFn = (world: World, deltaTime: number) => void;

import type { World } from './World.js';

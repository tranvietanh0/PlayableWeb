import type { SystemUpdateFn } from './types.js';

export interface SystemConfig {
  name: string;
  update: SystemUpdateFn;
  priority?: number;
}

export class System {
  readonly name: string;
  readonly update: SystemUpdateFn;
  readonly priority: number;

  constructor(config: SystemConfig) {
    this.name = config.name;
    this.update = config.update;
    this.priority = config.priority ?? 0;
  }
}

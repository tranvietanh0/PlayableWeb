import type { Entity, ComponentType } from '@pwe/ecs-core';

/**
 * Property decorator for exposed script fields.
 * Stores metadata so the editor / serializer knows how to handle the field.
 */
export interface PropertyMetadata {
  type: 'number' | 'string' | 'boolean' | 'vec2' | 'vec3' | 'color' | 'asset';
  default?: unknown;
  min?: number;
  max?: number;
  tooltip?: string;
}

const _propertyKey = Symbol('script:properties');

export function property(meta: PropertyMetadata) {
  return function (target: object, propertyKey: string | symbol) {
    const ctor = target.constructor as ComponentType & {
      [_propertyKey]?: Map<string | symbol, PropertyMetadata>;
    };
    if (!ctor[_propertyKey]) {
      ctor[_propertyKey] = new Map();
    }
    ctor[_propertyKey].set(propertyKey, meta);
  };
}

export function getScriptProperties(ctor: ComponentType): ReadonlyMap<string | symbol, PropertyMetadata> {
  return (ctor as { [_propertyKey]?: Map<string | symbol, PropertyMetadata> })[_propertyKey] ?? new Map();
}

/**
 * Script component that references a compiled script by name.
 * The ScriptSystem uses this to instantiate ScriptInstance objects.
 */
export class Script {
  scriptName = '';
  source = '';
  properties = new Map<string | symbol, unknown>();

  constructor(scriptName = '', source = '') {
    this.scriptName = scriptName;
    this.source = source;
  }
}

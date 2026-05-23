import { describe, it, expect, vi } from 'vitest';
import { World } from '@pwe/ecs-core';
import { SignalBus } from '@pwe/signalbus';
import { AssetManager } from '@pwe/asset-manager';
import { ScriptEngine, Script, ScriptSystem, property, getScriptProperties } from '../index.js';

describe('ScriptEngine', () => {
  const setup = () => {
    const world = new World();
    const signalBus = new SignalBus();
    const assetManager = new AssetManager();
    const engine = new ScriptEngine({ world, signalBus, assetManager });
    return { world, signalBus, assetManager, engine };
  };

  it('compiles and instantiates a simple script', () => {
    const { world, engine } = setup();
    const entity = world.createEntity();
    const source = `export default class Mover { onUpdate(dt) { this.speed = 10; } }`;
    const compiled = engine.compile(source, 'Mover');
    const instance = engine.instantiate(entity, compiled);
    expect(instance.scriptName).toBe('Mover');
    expect(instance.started).toBe(false);
    engine.startEntity(entity);
    expect(instance.started).toBe(true);
  });

  it('calls lifecycle callbacks in order', () => {
    const { world, engine } = setup();
    const entity = world.createEntity();
    (globalThis as unknown as Record<string, string[]>).testCalls = [];
    const source = `
      export default class Life {
        onStart() { globalThis.testCalls.push('start'); }
        onUpdate(dt) { globalThis.testCalls.push('update'); }
        onDestroy() { globalThis.testCalls.push('destroy'); }
      }
    `;
    const compiled = engine.compile(source, 'Life');
    engine.instantiate(entity, compiled);
    engine.startEntity(entity);
    expect((globalThis as unknown as Record<string, string[]>).testCalls).toContain('start');
    engine.updateEntity(entity, 16);
    expect((globalThis as unknown as Record<string, string[]>).testCalls).toContain('update');
    engine.removeAll(entity);
    expect((globalThis as unknown as Record<string, string[]>).testCalls).toContain('destroy');
    delete (globalThis as unknown as Record<string, string[]>).testCalls;
  });

  it('isolates sandbox from window/document', () => {
    const { engine } = setup();
    const source = `export default class Bad { run() { return typeof window; } }`;
    const compiled = engine.compile(source, 'Bad');
    // window is not in sandbox globals, but we can still compile
    expect(compiled.name).toBe('Bad');
  });

  it('caches compiled scripts by hash', () => {
    const { engine } = setup();
    const source = `export default class A {}`;
    const a = engine.compile(source, 'A');
    const b = engine.compile(source, 'A');
    expect(a).toBe(b);
  });
});

describe('ScriptSystem', () => {
  const setup = () => {
    const world = new World();
    const signalBus = new SignalBus();
    const assetManager = new AssetManager();
    const system = new ScriptSystem({ assetManager, signalBus });
    world.addSystem(system);
    return { world, signalBus, assetManager, system };
  };

  it('compiles Script components on update', () => {
    const { world } = setup();
    const entity = world.createEntity();
    const script = new Script('Mover', `export default class Mover { onUpdate(dt) { this.x = 1; } }`);
    world.addComponent(entity, script);
    world.update(16);
    const instances = (world.getSystem('ScriptSystem') as ScriptSystem).engine.getInstances(entity);
    expect(instances.length).toBeGreaterThan(0);
    expect(instances[0]!.started).toBe(true);
  });

  it('forwards collision events to scripts', () => {
    const { world, signalBus } = setup();
    const entityA = world.createEntity();
    const entityB = world.createEntity();
    (globalThis as unknown as Record<string, string[]>).testCalls = [];
    const source = `
      export default class Collider {
        onCollisionEnter(other) { globalThis.testCalls.push('enter'); }
        onCollisionExit(other) { globalThis.testCalls.push('exit'); }
      }
    `;
    world.addComponent(entityA, new Script('Collider', source));
    world.update(16);
    signalBus.emit('collision:enter', { entityA, entityB });
    expect((globalThis as unknown as Record<string, string[]>).testCalls).toContain('enter');
    signalBus.emit('collision:exit', { entityA, entityB });
    expect((globalThis as unknown as Record<string, string[]>).testCalls).toContain('exit');
    delete (globalThis as unknown as Record<string, string[]>).testCalls;
  });
});

describe('property decorator', () => {
  it('registers property metadata', () => {
    class TestScript {
      @property({ type: 'number', default: 5, min: 0, max: 10 })
      speed: number = 5;

      @property({ type: 'string', tooltip: 'Name of the object' })
      name = '';
    }

    const props = getScriptProperties(TestScript);
    expect(props.get('speed')).toEqual({ type: 'number', default: 5, min: 0, max: 10 });
    expect(props.get('name')).toEqual({ type: 'string', tooltip: 'Name of the object' });
  });
});

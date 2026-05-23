import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec3 } from '@pwe/math';
import { ThreeRenderSystem, Transform, MeshRenderer, Camera, Light } from '../index.js';

// Mock THREE to avoid real WebGL context in jsdom
vi.mock('three', () => {
  const Object3D = class {
    type = 'Object3D';
    position = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } };
    rotation = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } };
    scale = { x: 1, y: 1, z: 1, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } };
    children: unknown[] = [];
    parent: unknown = null;
    add(child: unknown) { this.children.push(child); }
    remove(child: unknown) { this.children = this.children.filter(c => c !== child); }
  };

  const Mesh = class extends Object3D {
    type = 'Mesh';
    geometry = { dispose: vi.fn() };
    material = { dispose: vi.fn() };
  };

  const Light = class extends Object3D {
    type = 'DirectionalLight';
  };

  return {
    Scene: class extends Object3D {
      type = 'Scene';
    },
    PerspectiveCamera: class extends Object3D {
      type = 'PerspectiveCamera';
      aspect = 1;
      fov = 75;
      near = 0.1;
      far = 1000;
      updateProjectionMatrix = vi.fn();
    },
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
    },
    Mesh,
    BoxGeometry: class { dispose = vi.fn(); },
    SphereGeometry: class { dispose = vi.fn(); },
    PlaneGeometry: class { dispose = vi.fn(); },
    MeshStandardMaterial: class { dispose = vi.fn(); },
    DirectionalLight: Light,
    Color: class {
      r: number; g: number; b: number;
      constructor(r: number, g: number, b: number) { this.r = r; this.g = g; this.b = b; }
    },
  };
});

describe('ThreeRenderSystem', () => {
  let world: World;
  let canvas: HTMLCanvasElement;
  let system: ThreeRenderSystem;

  beforeEach(() => {
    world = new World();
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    system = new ThreeRenderSystem(canvas);
  });

  afterEach(() => {
    system.dispose();
  });

  it('syncs a mesh entity to the Three.js scene', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform());
    const mesh = new MeshRenderer();
    mesh.geometry = 'box';
    world.addComponent(entity, mesh);

    system.sync(world);

    expect(system.scene.children.length).toBe(1);
    const obj = system.scene.children[0]!;
    expect(obj.type).toBe('Mesh');
  });

  it('removes mesh when entity loses MeshRenderer', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform());
    world.addComponent(entity, new MeshRenderer());

    system.sync(world);
    expect(system.scene.children.length).toBe(1);

    world.removeComponent(entity, MeshRenderer);
    system.sync(world);
    expect(system.scene.children.length).toBe(0);
  });

  it('updates camera from Camera component', () => {
    const camEntity = world.createEntity();
    const transform = new Transform();
    transform.position = new Vec3(0, 5, 10);
    world.addComponent(camEntity, transform);
    world.addComponent(camEntity, new Camera());

    system.sync(world);

    // Camera should be updated; scene may be empty
    expect(system.scene.children.length).toBe(0);
  });

  it('adds a light to the scene', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform());
    world.addComponent(entity, new Light());

    system.sync(world);

    expect(system.scene.children.length).toBe(1);
    expect(system.scene.children[0]!.type).toBe('DirectionalLight');
  });

  it('applies transform to objects', () => {
    const entity = world.createEntity();
    const transform = new Transform();
    transform.position = new Vec3(1, 2, 3);
    transform.rotation = new Vec3(0.1, 0.2, 0.3);
    transform.scale = new Vec3(2, 2, 2);
    world.addComponent(entity, transform);
    world.addComponent(entity, new MeshRenderer());

    system.sync(world);

    const obj = system.scene.children[0]! as any;
    expect(obj.position.x).toBeCloseTo(1);
    expect(obj.position.y).toBeCloseTo(2);
    expect(obj.position.z).toBeCloseTo(3);
    expect(obj.scale.x).toBeCloseTo(2);
  });

  it('handles resize', () => {
    system.resize(1024, 768);
    expect(system.renderer.setSize).toHaveBeenCalledWith(1024, 768);
  });

  it('exposes an update function for Engine integration', () => {
    expect(typeof system.update).toBe('function');
  });
});

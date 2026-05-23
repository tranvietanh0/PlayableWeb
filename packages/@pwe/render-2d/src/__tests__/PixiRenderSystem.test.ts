import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec2, Color } from '@pwe/math';
import { PixiRenderSystem, Transform2D, SpriteRenderer } from '../index.js';

// Mock pixi.js to avoid real WebGL/Canvas in jsdom
vi.mock('pixi.js', () => {
  const Container = class {
    children: unknown[] = [];
    addChild(child: unknown) { this.children.push(child); }
    removeChild(child: unknown) { this.children = this.children.filter(c => c !== child); }
  };

  const Sprite = class extends Container {
    position = { x: 0, y: 0, set(x: number, y: number) { this.x = x; this.y = y; } };
    scale = { x: 1, y: 1, set(x: number, y: number) { this.x = x; this.y = y; } };
    rotation = 0;
    tint = 0xffffff;
    alpha = 1;
    destroy = vi.fn();
  };

  const Renderer = class {
    resize = vi.fn();
  };

  const Application = class {
    stage = new Container();
    renderer = new Renderer();
    init = vi.fn().mockResolvedValue(undefined);
    destroy = vi.fn();
  };

  const ColorShared = class {
    static shared = {
      setValue: vi.fn().mockReturnValue({ toNumber: () => 0xffffff }),
    };
  };

  return {
    Application,
    Sprite,
    Container,
    Renderer,
    Color: { shared: ColorShared.shared },
  };
});

describe('PixiRenderSystem', () => {
  let world: World;
  let canvas: HTMLCanvasElement;
  let system: PixiRenderSystem;

  beforeEach(async () => {
    world = new World();
    canvas = document.createElement('canvas');
    system = new PixiRenderSystem(canvas);
    await system.init(canvas, 800, 600);
  });

  afterEach(() => {
    system.dispose();
  });

  it('syncs a sprite entity to the Pixi stage', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform2D());
    const sprite = new SpriteRenderer();
    sprite.texture = 'test.png';
    world.addComponent(entity, sprite);

    system.sync(world);

    expect(system.app.stage.children.length).toBe(1);
  });

  it('removes sprite when entity loses SpriteRenderer', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform2D());
    world.addComponent(entity, new SpriteRenderer());

    system.sync(world);
    expect(system.app.stage.children.length).toBe(1);

    world.removeComponent(entity, SpriteRenderer);
    system.sync(world);
    expect(system.app.stage.children.length).toBe(0);
  });

  it('applies transform to sprites', () => {
    const entity = world.createEntity();
    const transform = new Transform2D();
    transform.position = new Vec2(10, 20);
    transform.rotation = 1.5;
    transform.scale = new Vec2(2, 3);
    world.addComponent(entity, transform);
    world.addComponent(entity, new SpriteRenderer());

    system.sync(world);

    const sprite = system.app.stage.children[0] as any;
    expect(sprite.position.x).toBeCloseTo(10);
    expect(sprite.position.y).toBeCloseTo(20);
    expect(sprite.rotation).toBeCloseTo(1.5);
    expect(sprite.scale.x).toBeCloseTo(2);
    expect(sprite.scale.y).toBeCloseTo(3);
  });

  it('applies renderer properties', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform2D());
    const renderer = new SpriteRenderer();
    renderer.opacity = 0.5;
    renderer.tint = new Color(1, 0, 0, 1);
    renderer.flipX = true;
    world.addComponent(entity, renderer);

    system.sync(world);

    const sprite = system.app.stage.children[0] as any;
    expect(sprite.alpha).toBeCloseTo(0.5);
  });

  it('handles resize', () => {
    system.resize(1024, 768);
    expect(system.app.renderer.resize).toHaveBeenCalledWith(1024, 768);
  });

  it('exposes an update function for Engine integration', () => {
    expect(typeof system.update).toBe('function');
  });
});

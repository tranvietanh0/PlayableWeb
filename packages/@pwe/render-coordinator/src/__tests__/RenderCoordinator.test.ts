import { describe, it, expect, vi, beforeEach } from 'vitest';
import { World } from '@pwe/ecs-core';
import { Vec3, Vec2 } from '@pwe/math';
import { RenderCoordinator } from '../index.js';
import { Transform, MeshRenderer, Camera, Light } from '@pwe/render-3d';
import { Transform2D, SpriteRenderer } from '@pwe/render-2d';

function createMockThreeSystem() {
  return {
    sync: vi.fn(),
    render: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    scene: { children: [] },
    renderer: { domElement: document.createElement('canvas') },
    update: vi.fn(),
  } as any;
}

function createMockPixiSystem() {
  return {
    sync: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    app: { stage: { children: [] }, renderer: { resize: vi.fn() } },
    update: vi.fn(),
  } as any;
}

describe('RenderCoordinator', () => {
  let world: World;
  let mockThree: ReturnType<typeof createMockThreeSystem>;
  let mockPixi: ReturnType<typeof createMockPixiSystem>;

  beforeEach(() => {
    world = new World();
    mockThree = createMockThreeSystem();
    mockPixi = createMockPixiSystem();
  });

  it('detects 3D mode when only 3D entities exist', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform());
    world.addComponent(entity, new MeshRenderer());

    const coordinator = new RenderCoordinator({ three: mockThree });
    coordinator.render(world);

    expect(coordinator.mode).toBe('3d');
    expect(mockThree.sync).toHaveBeenCalled();
    expect(mockThree.render).toHaveBeenCalled();
  });

  it('detects 2D mode when only 2D entities exist', () => {
    const entity = world.createEntity();
    world.addComponent(entity, new Transform2D());
    world.addComponent(entity, new SpriteRenderer());

    const coordinator = new RenderCoordinator({ pixi: mockPixi });
    coordinator.render(world);

    expect(coordinator.mode).toBe('2d');
    expect(mockPixi.sync).toHaveBeenCalled();
  });

  it('detects mixed mode when both 2D and 3D entities exist', () => {
    const entity3D = world.createEntity();
    world.addComponent(entity3D, new Transform());
    world.addComponent(entity3D, new MeshRenderer());

    const entity2D = world.createEntity();
    world.addComponent(entity2D, new Transform2D());
    world.addComponent(entity2D, new SpriteRenderer());

    const coordinator = new RenderCoordinator({ three: mockThree, pixi: mockPixi });
    coordinator.render(world);

    expect(coordinator.mode).toBe('mixed');
    expect(mockThree.sync).toHaveBeenCalled();
    expect(mockThree.render).toHaveBeenCalled();
    expect(mockPixi.sync).toHaveBeenCalled();
  });

  it('resizes both renderers', () => {
    const coordinator = new RenderCoordinator({ three: mockThree, pixi: mockPixi });
    coordinator.resize(1024, 768);

    expect(mockThree.resize).toHaveBeenCalledWith(1024, 768);
    expect(mockPixi.resize).toHaveBeenCalledWith(1024, 768);
  });

  it('disposes both renderers', () => {
    const coordinator = new RenderCoordinator({ three: mockThree, pixi: mockPixi });
    coordinator.dispose();

    expect(mockThree.dispose).toHaveBeenCalled();
    expect(mockPixi.dispose).toHaveBeenCalled();
  });

  it('exposes an update function for Engine integration', () => {
    const coordinator = new RenderCoordinator({});
    expect(typeof coordinator.update).toBe('function');
  });
});

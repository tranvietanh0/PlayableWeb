import * as PIXI from 'pixi.js';
import type { World, Entity, SystemUpdateFn } from '@pwe/ecs-core';
import { Transform2D, SpriteRenderer } from './components.js';

export class PixiRenderSystem {
  readonly app: PIXI.Application;
  private _spriteMap = new Map<Entity, PIXI.Sprite>();
  private _updateFn: SystemUpdateFn;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application();
    // Defer init so tests can mock
    this._updateFn = (world: World, _dt: number) => {
      this.sync(world);
    };
  }

  async init(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    await this.app.init({ canvas, width, height, backgroundAlpha: 0 });
  }

  get update(): SystemUpdateFn {
    return this._updateFn;
  }

  sync(world: World): void {
    const transforms = world.getEntitiesWith(Transform2D);
    const present = new Set<Entity>();

    for (const entity of transforms) {
      present.add(entity);
      const transform = world.getComponent(entity, Transform2D)!;

      if (world.hasComponent(entity, SpriteRenderer)) {
        let sprite = this._spriteMap.get(entity);
        const renderer = world.getComponent(entity, SpriteRenderer)!;
        if (!sprite) {
          sprite = new PIXI.Sprite();
          this.app.stage.addChild(sprite);
          this._spriteMap.set(entity, sprite);
        }
        this._applyRenderer(sprite, renderer);
        this._applyTransform(sprite, transform);
      }
    }

    // Remove stale sprites
    for (const [entity, sprite] of this._spriteMap) {
      if (!present.has(entity) || !world.hasComponent(entity, SpriteRenderer)) {
        this.app.stage.removeChild(sprite);
        sprite.destroy();
        this._spriteMap.delete(entity);
      }
    }
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  dispose(): void {
    for (const sprite of this._spriteMap.values()) {
      sprite.destroy();
    }
    this._spriteMap.clear();
    this.app.destroy(true, { children: true });
  }

  private _applyTransform(sprite: PIXI.Sprite, t: Transform2D): void {
    sprite.position.set(t.position.x, t.position.y);
    sprite.rotation = t.rotation;
    sprite.scale.set(t.scale.x, t.scale.y);
  }

  private _applyRenderer(sprite: PIXI.Sprite, r: SpriteRenderer): void {
    sprite.tint = PIXI.Color.shared.setValue([r.tint.r, r.tint.g, r.tint.b]).toNumber();
    sprite.alpha = r.opacity * r.tint.a;
    sprite.scale.x = r.flipX ? -Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
    sprite.scale.y = r.flipY ? -Math.abs(sprite.scale.y) : Math.abs(sprite.scale.y);
  }
}

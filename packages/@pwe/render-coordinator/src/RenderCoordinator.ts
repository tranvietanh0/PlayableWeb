import type { World, SystemUpdateFn } from '@pwe/ecs-core';
import type { ThreeRenderSystem } from '@pwe/render-3d';
import type { PixiRenderSystem } from '@pwe/render-2d';
import { Transform, MeshRenderer, Camera, Light } from '@pwe/render-3d';
import { Transform2D, SpriteRenderer } from '@pwe/render-2d';

export interface RenderCoordinatorOptions {
  three?: ThreeRenderSystem;
  pixi?: PixiRenderSystem;
  canvas3D?: HTMLCanvasElement;
  canvas2D?: HTMLCanvasElement;
}

export class RenderCoordinator {
  private _three?: ThreeRenderSystem;
  private _pixi?: PixiRenderSystem;
  private _updateFn: SystemUpdateFn;
  private _mode: '3d' | '2d' | 'mixed' = '3d';

  constructor(options: RenderCoordinatorOptions) {
    this._three = options.three;
    this._pixi = options.pixi;

    this._updateFn = (world: World, _dt: number) => {
      this._detectMode(world);
      this.render(world);
    };
  }

  get update(): SystemUpdateFn {
    return this._updateFn;
  }

  get mode(): '3d' | '2d' | 'mixed' {
    return this._mode;
  }

  render(world: World): void {
    this._detectMode(world);
    if (this._mode === '3d' && this._three) {
      this._three.sync(world);
      this._three.render();
    } else if (this._mode === '2d' && this._pixi) {
      this._pixi.sync(world);
    } else if (this._mode === 'mixed') {
      // 3D scene first, then 2D overlay
      if (this._three) {
        this._three.sync(world);
        this._three.render();
      }
      if (this._pixi) {
        this._pixi.sync(world);
      }
    }
  }

  resize(width: number, height: number): void {
    this._three?.resize(width, height);
    this._pixi?.resize(width, height);
  }

  dispose(): void {
    this._three?.dispose();
    this._pixi?.dispose();
  }

  private _detectMode(world: World): void {
    const has3D = world.getEntitiesWith(Transform).some(
      e => world.hasComponent(e, MeshRenderer) || world.hasComponent(e, Camera) || world.hasComponent(e, Light)
    );
    const has2D = world.getEntitiesWith(Transform2D).some(
      e => world.hasComponent(e, SpriteRenderer)
    );

    if (has3D && has2D) {
      this._mode = 'mixed';
    } else if (has2D) {
      this._mode = '2d';
    } else {
      this._mode = '3d';
    }
  }
}

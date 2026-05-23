import * as THREE from 'three';
import type { World, Entity, SystemUpdateFn } from '@pwe/ecs-core';
import { Transform, MeshRenderer, Camera, Light } from './components.js';

export class ThreeRenderSystem {
  readonly scene = new THREE.Scene();
  readonly renderer: THREE.WebGLRenderer;

  private _cameraEntity: Entity | null = null;
  private _threeCamera: THREE.PerspectiveCamera;
  private _objectMap = new Map<Entity, THREE.Object3D>();
  private _updateFn: SystemUpdateFn;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this._threeCamera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this._threeCamera.position.set(0, 0, 5);

    this._updateFn = (world: World, _dt: number) => {
      this.sync(world);
      this.render();
    };
  }

  get update(): SystemUpdateFn {
    return this._updateFn;
  }

  sync(world: World): void {
    const transforms = world.getEntitiesWith(Transform);
    const present = new Set<Entity>();

    for (const entity of transforms) {
      present.add(entity);
      const transform = world.getComponent(entity, Transform)!;

      if (world.hasComponent(entity, Camera)) {
        this._cameraEntity = entity;
        const cam = world.getComponent(entity, Camera)!;
        this._updateCamera(cam, transform);
      }

      if (world.hasComponent(entity, MeshRenderer)) {
        let obj = this._objectMap.get(entity);
        if (!obj) {
          obj = this._createMesh(world.getComponent(entity, MeshRenderer)!);
          this.scene.add(obj);
          this._objectMap.set(entity, obj);
        }
        this._applyTransform(obj, transform);
      }

      if (world.hasComponent(entity, Light)) {
        let obj = this._objectMap.get(entity);
        if (!obj) {
          obj = this._createLight(world.getComponent(entity, Light)!);
          this.scene.add(obj);
          this._objectMap.set(entity, obj);
        }
        this._applyTransform(obj, transform);
      }
    }

    // Remove stale objects (entity destroyed or component removed)
    for (const [entity, obj] of this._objectMap) {
      const hasRenderable = world.hasComponent(entity, MeshRenderer) || world.hasComponent(entity, Light);
      if (!present.has(entity) || !hasRenderable) {
        this.scene.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
        this._objectMap.delete(entity);
      }
    }
  }

  render(): void {
    if (this._cameraEntity !== null) {
      this.renderer.render(this.scene, this._threeCamera);
    }
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this._threeCamera.aspect = width / height;
    this._threeCamera.updateProjectionMatrix();
  }

  dispose(): void {
    this.renderer.dispose();
    for (const obj of this._objectMap.values()) {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    }
    this._objectMap.clear();
  }

  private _createMesh(renderer: MeshRenderer): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    switch (renderer.geometry) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 16, 16);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(1, 1);
        break;
      case 'box':
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
    }
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(renderer.color.r, renderer.color.g, renderer.color.b),
      transparent: renderer.color.a < 1,
      opacity: renderer.color.a,
    });
    return new THREE.Mesh(geometry, material);
  }

  private _createLight(light: Light): THREE.Light {
    const l = new THREE.DirectionalLight(
      new THREE.Color(light.color.r, light.color.g, light.color.b),
      light.intensity
    );
    return l;
  }

  private _applyTransform(obj: THREE.Object3D, t: Transform): void {
    obj.position.set(t.position.x, t.position.y, t.position.z);
    obj.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    obj.scale.set(t.scale.x, t.scale.y, t.scale.z);
  }

  private _updateCamera(cam: Camera, t: Transform): void {
    this._threeCamera.fov = cam.fov;
    this._threeCamera.near = cam.near;
    this._threeCamera.far = cam.far;
    this._threeCamera.position.set(t.position.x, t.position.y, t.position.z);
    this._threeCamera.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    this._threeCamera.updateProjectionMatrix();
  }
}

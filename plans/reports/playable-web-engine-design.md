# PlayableWeb Engine — Architecture Design Document

**Version**: 1.0  
**Date**: 2026-05-23  
**Status**: Approved for implementation  
**Scope**: Browser-based game editor & runtime for playable ads / instant games  

---

## 1. Executive Summary

PlayableWeb Engine (PWE) is a browser-native game editor and runtime targeting playable ads and instant mini-games. It provides a Unity-like editing experience entirely inside the browser: drag-and-drop scene editing, live preview, TypeScript scripting, real-time multiplayer collaboration, and one-click export to a single HTML playable ad.

**Key decisions locked:**
- **Renderers**: Three.js (3D) + PixiJS v8 (2D) — hybrid, tree-shakeable.
- **ECS**: Custom lightweight ECS — total control, minimal bundle size.
- **Physics**: Planck.js (2D) + Rapier (3D WASM) — best accuracy, acceptable size.
- **Collaboration**: Yjs CRDT for real-time editing + Git-style versioning for releases.
- **Scripting**: TypeScript code-first via Monaco Editor, compiled in Web Workers.

---

## 2. Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EDITOR APPLICATION                        │
│  (React 19 + TypeScript + Zustand + Tailwind + Radix UI)    │
│                                                             │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │Hierarchy│ │ Inspector│ │Asset Browser│ │ Script Editor│ │
│  │ (Tree)  │ │(Property)│ │  (Grid)     │ │  (Monaco)    │ │
│  └────┬────┘ └────┬─────┘ └──────┬──────┘ └──────┬───────┘ │
│       └─────────────┴─────────────┴───────────────┘         │
│                          │                                  │
│                   ┌──────────────┐                         │
│                   │   Viewport   │  ← r3f / react-pixi     │
│                   │ (Play/Edit)  │                         │
│                   └──────────────┘                         │
└──────────────────────────┬──────────────────────────────────┘
                           │  MessageBus (postMessage / EventEmitter)
┌──────────────────────────┴──────────────────────────────────┐
│                     ENGINE CORE (TS)                         │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   ECS    │  │  Scene   │  │   Asset     │  │  Script  │ │
│  │  World   │  │  Graph   │  │   Manager   │  │  Engine  │ │
│  └────┬─────┘  └────┬─────┘  └──────┬──────┘  └────┬─────┘ │
│       └──────────────┴───────────────┴──────────────┘       │
│                          │                                  │
│                   ┌──────────────┐                         │
│                   │   Systems    │                         │
│                   │ (Update Loop)│                         │
│                   └──────────────┘                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌──────────┐     ┌──────────┐      ┌──────────────┐
   │ Three.js │     │  PixiJS  │      │   Physics    │
   │ (WebGL2) │     │ (WebGL2) │      │Planck/Rapier │
   └──────────┘     └──────────┘      └──────────────┘
```

### 2.1. Editor / Runtime Separation

| Layer | Responsibility | Bundle Size Constraint |
|---|---|---|
| **Editor** | React UI, scene manipulation, gizmos, undo/redo, collaboration | No limit (web app) |
| **Engine Core** | ECS, scene graph, serialization, scripting VM | <150KB gzipped |
| **Renderers** | Three.js + PixiJS (import only what's used) | <200KB gzipped |
| **Physics** | Planck.js or Rapier WASM (loaded on demand) | <250KB gzipped |
| **Runtime Export** | Engine Core + Renderers + Game Scripts + Assets | <2MB total |

The **Editor** and **Runtime** share the same `Engine Core` package. During export, a Rollup/Vite bundler tree-shakes away the Editor and unused engine modules.

---

## 3. Engine Architecture

### 3.1. Module Hierarchy

```
packages/
├── engine-core/           # ECS, math, serialization, event bus
│   ├── src/
│   │   ├── ecs/
│   │   ├── scene/
│   │   ├── math/
│   │   ├── events/
│   │   └── serialize/
│   └── package.json
├── engine-render-3d/      # Three.js integration
├── engine-render-2d/      # PixiJS integration
├── engine-physics-2d/     # Planck.js integration
├── engine-physics-3d/     # Rapier WASM integration
├── engine-script/         # TS compiler + VM
├── editor-ui/             # React editor shell
├── editor-viewport-3d/    # r3f viewport
├── editor-viewport-2d/    # react-pixi viewport
└── shared-types/          # Shared TS interfaces
```

### 3.2. Engine Entry Point

```typescript
// engine-core/src/Engine.ts
export class Engine {
  readonly world: World;
  readonly assetManager: AssetManager;
  readonly signalBus: SignalBus;
  readonly input: InputManager;
  readonly renderer: RenderCoordinator;
  readonly physics: PhysicsCoordinator;
  readonly scriptEngine: ScriptEngine;

  private _running = false;
  private _mode: 'edit' | 'play' = 'edit';

  constructor(config: EngineConfig) { ... }

  start(): void {
    this._running = true;
    this.loop(performance.now());
  }

  stop(): void { this._running = false; }

  setMode(mode: 'edit' | 'play'): void {
    this._mode = mode;
    this.world.setMode(mode);
  }

  private loop = (now: number): void => {
    if (!this._running) return;
    const dt = this.calculateDeltaTime(now);
    this.world.update(dt);
    this.renderer.render(this.world);
    requestAnimationFrame(this.loop);
  };
}
```

---

## 4. Runtime Architecture

### 4.1. Edit Mode vs Play Mode

Unity's Play Mode is the gold standard. PWE replicates it exactly:

| Feature | Edit Mode | Play Mode |
|---|---|---|
| **Time scale** | Real time | Game time (0 = paused) |
| **Physics** | Preview only (manual step) | Full simulation |
| **Scripts** | Editor scripts (inspectors, tools) | Runtime scripts (gameplay) |
| **Input** | Editor shortcuts (WASD = camera) | Game input bindings |
| **Undo/Redo** | Full stack (commands) | Disabled |
| **Serialization** | Live-save to JSON | Frozen snapshot |
| **Entity mutation** | Immediate | Cloned sandbox |

### 4.2. Mode Transition (Critical Path)

```
User clicks ▶️ PLAY
│
├─ 1. SNAPSHOT: EditorWorld.deepClone() → SnapshotWorld
├─ 2. ISOLATE: SnapshotWorld runs in separate RAF loop
├─ 3. INIT: ScriptEngine mounts all Script components
│          Script.onStart() called for every active script
├─ 4. RUN: SnapshotWorld.update(dt) every frame
│
User clicks ⏹️ STOP
│
├─ 5. TEARDOWN: Script.onDestroy() called
├─ 6. DISPOSE: SnapshotWorld.destroy() (free memory)
└─ 7. RESTORE: EditorWorld reverts to pre-play state
```

**Why deep clone?** Play Mode can destroy entities, add/remove components, and mutate asset references. We do NOT want these mutations to persist in Edit Mode. The snapshot is a pure data boundary.

**Implementation**:
```typescript
class EditorSession {
  private editorWorld: World;
  private playWorld: World | null = null;
  private prePlaySnapshot: SceneJSON | null = null;

  enterPlayMode(): void {
    this.prePlaySnapshot = this.editorWorld.serialize();
    this.playWorld = World.deserialize(this.prePlaySnapshot);
    this.playWorld.setMode('play');
    this.playWorld.start();
  }

  exitPlayMode(): void {
    this.playWorld?.stop();
    this.playWorld?.destroy();
    this.playWorld = null;
    if (this.prePlaySnapshot) {
      this.editorWorld = World.deserialize(this.prePlaySnapshot);
      this.prePlaySnapshot = null;
    }
  }
}
```

---

## 5. ECS Design (Entity-Component-System)

### 5.1. Philosophy

PWE uses an **archetype-free, sparse-set ECS**. Archetype ECS (like Unity DOTS) is fast but causes expensive structural changes when adding/removing components. For an editor where users drag-and-drop components constantly, archetype churn is unacceptable.

### 5.2. Core Implementation

```typescript
// ecs/World.ts
export type Entity = number; // uint32, recycled via free list
export type ComponentTypeId = string;

export class World {
  private nextId = 1;
  private freeList: Entity[] = [];
  private entities = new Set<Entity>();
  
  // Sparse storage: componentType -> entity -> componentData
  private storage = new Map<ComponentTypeId, Map<Entity, Component>>();
  
  private systems: System[] = [];
  private entityNames = new Map<Entity, string>();

  createEntity(name?: string): Entity {
    const id = this.freeList.pop() ?? this.nextId++;
    this.entities.add(id);
    if (name) this.entityNames.set(id, name);
    this.signalBus.emit('entity:created', { entity: id });
    return id;
  }

  destroyEntity(entity: Entity): void {
    // Remove all components
    for (const [type, map] of this.storage) {
      if (map.has(entity)) {
        map.delete(entity);
        this.signalBus.emit('component:removed', { entity, type });
      }
    }
    this.entities.delete(entity);
    this.entityNames.delete(entity);
    this.freeList.push(entity);
    this.signalBus.emit('entity:destroyed', { entity });
  }

  addComponent<T extends Component>(
    entity: Entity, 
    type: ComponentTypeId, 
    data: T
  ): void {
    let map = this.storage.get(type);
    if (!map) {
      map = new Map();
      this.storage.set(type, map);
    }
    map.set(entity, data);
    this.signalBus.emit('component:added', { entity, type, data });
  }

  getComponent<T extends Component>(entity: Entity, type: ComponentTypeId): T | undefined {
    return this.storage.get(type)?.get(entity) as T | undefined;
  }

  removeComponent(entity: Entity, type: ComponentTypeId): void {
    const map = this.storage.get(type);
    if (map?.delete(entity)) {
      this.signalBus.emit('component:removed', { entity, type });
    }
  }

  query(q: Query): Entity[] {
    const result: Entity[] = [];
    // Optimization: start with smallest component set
    const smallest = q.with
      .map(type => this.storage.get(type))
      .filter(Boolean)
      .sort((a, b) => a!.size - b!.size)[0];
    
    if (!smallest) return result;
    
    for (const entity of smallest.keys()) {
      if (this.entities.has(entity) &&
          q.with.every(type => this.storage.get(type)?.has(entity)) &&
          !q.without?.some(type => this.storage.get(type)?.has(entity))) {
        result.push(entity);
      }
    }
    return result;
  }

  update(dt: number): void {
    for (const system of this.systems) {
      if (system.enabled) system.update(this, dt);
    }
  }
}
```

### 5.3. Built-in Components

```typescript
// Transform — required for almost everything
interface Transform {
  localPosition: Vec3;
  localRotation: Quat;
  localScale: Vec3;
  // World matrix computed by TransformSystem, cached
  _worldMatrix: Mat4 | null;
  _dirty: boolean;
}

// Hierarchy — parent/child relationships
interface Hierarchy {
  parent: Entity | null;
  children: Entity[];
}

// 2D Rendering
interface SpriteRenderer {
  spriteId: string;     // GUID → AssetManager
  tint: Color;
  opacity: number;
  layer: number;
  flipX: boolean;
  flipY: boolean;
}

// 3D Rendering
interface MeshRenderer {
  meshId: string;       // GUID
  materialId: string;   // GUID
  castShadows: boolean;
  receiveShadows: boolean;
}

// Lighting
interface Light {
  type: 'directional' | 'point' | 'spot';
  color: Color;
  intensity: number;
  range: number;        // point/spot only
  angle: number;        // spot only
}

// Physics 2D
interface Rigidbody2D {
  bodyType: 'dynamic' | 'static' | 'kinematic';
  mass: number;
  linearDamping: number;
  angularDamping: number;
  fixedRotation: boolean;
  gravityScale: number;
}

interface Collider2D {
  shape: 'box' | 'circle' | 'polygon';
  offset: Vec2;
  isTrigger: boolean;
  // Shape-specific data
  size?: Vec2;          // box
  radius?: number;      // circle
  points?: Vec2[];      // polygon
}

// Physics 3D
interface Rigidbody {
  bodyType: 'dynamic' | 'static' | 'kinematic';
  mass: number;
  linearDamping: number;
  angularDamping: number;
  useGravity: boolean;
}

interface Collider {
  shape: 'box' | 'sphere' | 'capsule' | 'mesh';
  offset: Vec3;
  isTrigger: boolean;
  size?: Vec3;          // box
  radius?: number;      // sphere
  height?: number;      // capsule
  meshId?: string;      // mesh collider
}

// Scripting
interface Script {
  scriptId: string;     // GUID → source code in AssetManager
  enabled: boolean;
  properties: Record<string, any>;  // serialized @property fields
  _instance?: ScriptInstance;  // runtime VM instance (not serialized)
}

// Audio
interface AudioSource {
  clipId: string;
  volume: number;
  pitch: number;
  loop: boolean;
  playOnStart: boolean;
  spatialBlend: number; // 0 = 2D, 1 = 3D
}

// Animation
interface Animator {
  controllerId: string; // GUID → AnimationController asset
  state: string;        // current state name
  time: number;
  speed: number;
}
```

### 5.4. System Execution Order

```typescript
const DEFAULT_SYSTEM_ORDER = [
  InputSystem,           // Poll input devices
  ScriptEarlyUpdate,     // Script.onEarlyUpdate()
  PhysicsFixedStep,      // Fixed timestep physics
  AnimationSystem,       // Update animation states
  ScriptUpdate,          // Script.onUpdate()
  TransformSystem,       // Recalculate world matrices
  CameraSystem,          // Update camera matrices
  ScriptLateUpdate,      // Script.onLateUpdate()
  AudioSystem,           // Update spatial audio
  RenderSystem2D,        // PixiJS render
  RenderSystem3D,        // Three.js render
  GizmoSystem,           // Editor-only: draw handles
];
```

---

## 6. Scene Graph Structure

### 6.1. ECS-First, Tree-Second

The **ECS is the source of truth**. The scene tree is a **derived view** built from `Hierarchy` components.

```typescript
// scene/SceneGraph.ts
export class SceneGraph {
  constructor(private world: World) {}

  getRootEntities(): Entity[] {
    return this.world.query({
      with: ['Hierarchy'],
      without: ['parent']  // entities where hierarchy.parent === null
    }).filter(e => {
      const h = this.world.getComponent<Hierarchy>(e, 'Hierarchy');
      return h?.parent === null;
    });
  }

  getChildren(entity: Entity): Entity[] {
    const h = this.world.getComponent<Hierarchy>(entity, 'Hierarchy');
    return h?.children ?? [];
  }

  reparent(child: Entity, newParent: Entity | null): void {
    const childH = this.world.getComponent<Hierarchy>(child, 'Hierarchy') ?? { parent: null, children: [] };
    const oldParent = childH.parent;

    // Remove from old parent
    if (oldParent !== null) {
      const oldParentH = this.world.getComponent<Hierarchy>(oldParent, 'Hierarchy');
      if (oldParentH) {
        oldParentH.children = oldParentH.children.filter(c => c !== child);
      }
    }

    // Add to new parent
    if (newParent !== null) {
      const newParentH = this.world.getComponent<Hierarchy>(newParent, 'Hierarchy') ?? { parent: null, children: [] };
      newParentH.children.push(child);
      this.world.addComponent(newParent, 'Hierarchy', newParentH);
    }

    childH.parent = newParent;
    this.world.addComponent(child, 'Hierarchy', childH);

    // Mark transform dirty so world matrix recalculates
    const t = this.world.getComponent<Transform>(child, 'Transform');
    if (t) t._dirty = true;
  }
}
```

### 6.2. Transform Inheritance

```typescript
class TransformSystem extends System {
  update(world: World, dt: number): void {
    const roots = world.query({ with: ['Transform', 'Hierarchy'] })
      .filter(e => world.getComponent<Hierarchy>(e, 'Hierarchy')?.parent === null);

    for (const root of roots) {
      this.updateRecursive(world, root, Mat4.identity);
    }
  }

  private updateRecursive(world: World, entity: Entity, parentMatrix: Mat4): void {
    const transform = world.getComponent<Transform>(entity, 'Transform');
    if (!transform) return;

    if (transform._dirty || transform._worldMatrix === null) {
      const local = Mat4.fromTRS(
        transform.localPosition,
        transform.localRotation,
        transform.localScale
      );
      transform._worldMatrix = Mat4.multiply(parentMatrix, local);
      transform._dirty = false;
    }

    const hierarchy = world.getComponent<Hierarchy>(entity, 'Hierarchy');
    if (hierarchy) {
      for (const child of hierarchy.children) {
        this.updateRecursive(world, child, transform._worldMatrix);
      }
    }
  }
}
```

**Key optimization**: `_dirty` flag. Only entities whose `localPosition/Rotation/Scale` changed (or whose parent's transform changed) get recalculated. This is O(changed) not O(all).

---

## 7. Rendering Pipeline

### 7.1. Render Abstraction Layer

```typescript
abstract class RenderSystem extends System {
  abstract render(world: World, cameraEntity: Entity): void;
  abstract resize(width: number, height: number): void;
  abstract dispose(): void;
}
```

### 7.2. Three.js Integration (3D)

```typescript
class ThreeRenderSystem extends RenderSystem {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private objectCache = new Map<Entity, THREE.Object3D>();

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  }

  render(world: World, cameraEntity: Entity): void {
    this.syncEntities(world);
    this.syncLights(world);

    const cameraTransform = world.getComponent<Transform>(cameraEntity, 'Transform');
    const cameraComp = world.getComponent<Camera>(cameraEntity, 'Camera');
    
    const camera = new THREE.PerspectiveCamera(
      cameraComp.fov,
      this.renderer.domElement.width / this.renderer.domElement.height,
      cameraComp.near,
      cameraComp.far
    );
    // Apply camera transform...

    this.renderer.render(this.scene, camera);
  }

  private syncEntities(world: World): void {
    const entities = world.query({ with: ['Transform', 'MeshRenderer'] });
    
    // Add/update
    for (const entity of entities) {
      let obj = this.objectCache.get(entity);
      if (!obj) {
        obj = new THREE.Object3D();
        this.objectCache.set(entity, obj);
        this.scene.add(obj);
      }
      
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      obj.matrix.fromArray(transform._worldMatrix!.toArray());
      obj.matrixAutoUpdate = false;

      const renderer = world.getComponent<MeshRenderer>(entity, 'MeshRenderer')!;
      // Sync mesh/material from AssetManager...
    }

    // Remove destroyed entities
    for (const [entity, obj] of this.objectCache) {
      if (!entities.includes(entity)) {
        this.scene.remove(obj);
        this.objectCache.delete(entity);
      }
    }
  }
}
```

### 7.3. PixiJS Integration (2D)

```typescript
class PixiRenderSystem extends RenderSystem {
  private app: PIXI.Application;
  private displayCache = new Map<Entity, PIXI.DisplayObject>();

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
      backgroundAlpha: 0, // Transparent so 3D can show behind
    });
  }

  render(world: World, cameraEntity: Entity): void {
    this.syncSprites(world);
    // Pixi Application ticker handles the actual render
  }

  private syncSprites(world: World): void {
    const entities = world.query({ with: ['Transform', 'SpriteRenderer'] });
    
    for (const entity of entities) {
      let sprite = this.displayCache.get(entity) as PIXI.Sprite | undefined;
      const spriteComp = world.getComponent<SpriteRenderer>(entity, 'SpriteRenderer')!;
      const transform = world.getComponent<Transform>(entity, 'Transform')!;

      if (!sprite) {
        const texture = AssetManager.getTexture(spriteComp.spriteId);
        sprite = new PIXI.Sprite(texture);
        this.displayCache.set(entity, sprite);
        this.app.stage.addChild(sprite);
      }

      // Apply transform (2D uses position.x/y, scale.x/y, rotation z)
      sprite.x = transform.localPosition.x;
      sprite.y = transform.localPosition.y;
      sprite.scale.set(transform.localScale.x, transform.localScale.y);
      sprite.rotation = transform.localRotation.toEuler().z;
      sprite.tint = parseInt(spriteComp.tint.replace('#', ''), 16);
      sprite.alpha = spriteComp.opacity;
    }

    // Cleanup removed entities
    for (const [entity, obj] of this.displayCache) {
      if (!entities.includes(entity)) {
        this.app.stage.removeChild(obj);
        obj.destroy();
        this.displayCache.delete(entity);
      }
    }
  }
}
```

### 7.4. 2D + 3D Mixed Mode

A scene can contain both 2D and 3D entities. The `RenderCoordinator` decides how to composite:

```typescript
class RenderCoordinator {
  render(world: World): void {
    const has3D = world.query({ with: ['MeshRenderer'] }).length > 0;
    const has2D = world.query({ with: ['SpriteRenderer'] }).length > 0;

    if (has3D) {
      this.threeSystem.render(world, this.activeCamera);
    }

    if (has2D) {
      // If mixed, render 2D on top of 3D with transparent background
      this.pixiSystem.render(world, this.activeCamera);
    }
  }
}
```

**Use case**: A 3D game with a 2D HUD (health bar, score) rendered via PixiJS overlay.

---

## 8. Asset Management System

### 8.1. Asset Types & GUIDs

Every asset has a UUIDv4 GUID. File extensions determine the importer:

| Extension | Asset Type | Importer Output |
|---|---|---|
| `.png`, `.jpg`, `.webp` | `Texture` | WebP texture + mipmaps |
| `.svg` | `VectorSprite` | Rasterized PNG at target sizes |
| `.json` (glTF) | `Mesh` | Three.js BufferGeometry |
| `.mp3`, `.wav`, `.ogg` | `AudioClip` | Web Audio `AudioBuffer` |
| `.ts`, `.js` | `Script` | Raw source + compiled JS |
| `.json` (scene) | `Scene` | Scene graph JSON |
| `.prefab` | `Prefab` | Entity template JSON |
| `.anim` | `AnimationClip` | Keyframe data |
| `.mat` | `Material` | Shader + uniform values |
| `.font` | `Font` | Bitmap font atlas |

### 8.2. Virtual File System

```typescript
class AssetManager {
  private assets = new Map<string, Asset>();      // guid -> Asset
  private importerCache = new Map<string, any>(); // guid -> imported data

  async import(file: File): Promise<string> {
    const guid = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to backend / IndexedDB
    await this.storage.put(guid, arrayBuffer);
    
    const asset: Asset = {
      guid,
      name: file.name,
      type: this.inferType(file.name),
      size: file.size,
      mimeType: file.type,
      imported: false,
    };
    
    this.assets.set(guid, asset);
    return guid;
  }

  async load<T>(guid: string): Promise<T> {
    if (this.importerCache.has(guid)) {
      return this.importerCache.get(guid);
    }
    
    const asset = this.assets.get(guid);
    if (!asset) throw new Error(`Asset not found: ${guid}`);
    
    const raw = await this.storage.get(guid);
    const imported = await this.runImporter(asset.type, raw);
    this.importerCache.set(guid, imported);
    return imported;
  }

  private async runImporter(type: AssetType, raw: ArrayBuffer): Promise<any> {
    switch (type) {
      case 'Texture': return this.importTexture(raw);
      case 'Mesh': return this.importMesh(raw);
      case 'AudioClip': return this.importAudio(raw);
      case 'Script': return this.importScript(raw);
      default: return raw;
    }
  }
}
```

### 8.3. Addressable-like Loading

```typescript
// At level start, preload all referenced assets
const sceneAssets = currentScene.getReferencedAssetGuids();
await Promise.all(sceneAssets.map(guid => AssetManager.load(guid)));

// During gameplay, lazy load
const enemyPrefab = await AssetManager.load<Prefab>('guid-enemy-prefab');
const instance = enemyPrefab.instantiate(world);
```

### 8.4. Export Pipeline for Playable Ads

When exporting, the bundler:
1. Tree-shakes the engine (only include used systems/renderers).
2. Inlines all referenced assets as base64 DataURLs or binary blobs.
3. Compiles TypeScript scripts to JS.
4. Outputs a **single `index.html`** containing everything.

---

## 9. Physics Integration

### 9.1. 2D Physics — Planck.js

Planck.js is a complete Box2D rewrite in TypeScript. It gives us accurate rigidbody physics, joints, and raycasting.

```typescript
class PhysicsSystem2D extends System {
  private world: planck.World;
  private bodyMap = new Map<Entity, planck.Body>();

  constructor() {
    super();
    this.world = new planck.World({ gravity: planck.Vec2(0, -9.8) });
  }

  update(world: World, dt: number): void {
    // Sync ECS → Physics
    this.syncToPhysics(world);
    
    // Step simulation (fixed timestep)
    const step = 1 / 60;
    this.world.step(step, 8, 3); // velocityIterations, positionIterations
    
    // Sync Physics → ECS
    this.syncFromPhysics(world);
    
    // Emit collision events
    this.emitCollisionEvents(world);
  }

  private syncToPhysics(world: World): void {
    const entities = world.query({ with: ['Transform', 'Rigidbody2D'] });
    for (const entity of entities) {
      let body = this.bodyMap.get(entity);
      const rb = world.getComponent<Rigidbody2D>(entity, 'Rigidbody2D')!;
      const transform = world.getComponent<Transform>(entity, 'Transform')!;

      if (!body) {
        body = this.world.createBody({
          type: rb.bodyType,
          position: planck.Vec2(transform.localPosition.x, transform.localPosition.y),
        });
        this.bodyMap.set(entity, body);
        
        // Add colliders
        const colliders = world.query({ with: ['Collider2D'] })
          .filter(e => /* belongs to entity */);
        for (const c of colliders) {
          const col = world.getComponent<Collider2D>(c, 'Collider2D')!;
          // Create fixtures...
        }
      }

      body.setPosition(planck.Vec2(transform.localPosition.x, transform.localPosition.y));
      body.setAngle(transform.localRotation.toEuler().z);
    }
  }

  private syncFromPhysics(world: World): void {
    for (const [entity, body] of this.bodyMap) {
      const pos = body.getPosition();
      const angle = body.getAngle();
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      transform.localPosition.set(pos.x, pos.y, transform.localPosition.z);
      transform.localRotation = Quat.fromEuler(0, 0, angle);
      transform._dirty = true;
    }
  }
}
```

### 9.2. 3D Physics — Rapier (WASM)

Rapier is a Rust physics engine compiled to WASM. It's faster and more stable than Cannon.js.

```typescript
class PhysicsSystem3D extends System {
  private world: RAPIER.World;
  private bodyMap = new Map<Entity, RAPIER.RigidBody>();

  constructor() {
    super();
    await RAPIER.init(); // Load WASM module
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  }

  update(world: World, dt: number): void {
    this.syncToPhysics(world);
    this.world.step();
    this.syncFromPhysics(world);
  }
}
```

### 9.3. Physics-ECS Communication

Physics events are bridged to the SignalBus:

```typescript
// In syncFromPhysics or collision listener
this.signalBus.emit('physics:collisionEnter', {
  entityA,
  entityB,
  contactPoint,
  impulse,
});

// Scripts subscribe
this.signalBus.subscribe('physics:collisionEnter', (data) => {
  if (data.entityA === this.entity) {
    this.onCollisionEnter(data.entityB);
  }
});
```

---

## 10. Core Game Logic Architecture

### 10.1. Scripting in the Browser

**Challenge**: We need to compile and execute user-written TypeScript inside the browser securely.

**Solution**: Monaco Editor + TypeScript Compiler API in Web Worker + Sandboxed VM.

```typescript
class ScriptEngine {
  private tsWorker: Worker;
  private vm: QuickJSVm | SandboxedEval;

  constructor() {
    // Web Worker runs the TS compiler (heavy, off main thread)
    this.tsWorker = new Worker('/workers/ts-compiler.js');
  }

  async compile(scriptId: string, source: string): Promise<string> {
    return new Promise((resolve) => {
      this.tsWorker.postMessage({ scriptId, source });
      this.tsWorker.onmessage = (e) => resolve(e.data.compiled);
    });
  }

  mount(world: World, entity: Entity, scriptId: string): ScriptInstance {
    const scriptComp = world.getComponent<Script>(entity, 'Script')!;
    const compiledJS = AssetManager.getCompiledScript(scriptId);
    
    // Create a sandbox with injected engine API
    const sandbox = {
      Engine: {
        world,
        signalBus,
        input,
        assetManager,
        instantiate: (prefabId: string) => { ... },
        destroy: (entity: Entity) => { ... },
      },
      console: { log: (...args: any[]) => this.safeLog(entity, ...args) },
      Math, Date, JSON, // Whitelist safe globals
    };
    
    const instance = new ScriptInstance(compiledJS, sandbox);
    instance.call('onStart');
    return instance;
  }

  update(instances: ScriptInstance[], dt: number): void {
    for (const inst of instances) {
      inst.call('onUpdate', dt);
    }
  }
}
```

### 10.2. Script Class Pattern

User writes TypeScript classes that extend a base `Script` class:

```typescript
// User-written script, edited in Monaco
import { Script, property, Entity } from 'playableweb-engine';

export class PlayerController extends Script {
  @property(Number)
  speed: number = 5;

  @property(Entity)
  bulletPrefab: Entity | null = null;

  private rb: Rigidbody2D | null = null;

  onStart(): void {
    this.rb = this.getComponent<Rigidbody2D>('Rigidbody2D');
  }

  onUpdate(dt: number): void {
    const input = Engine.input.getAxis('horizontal');
    if (this.rb) {
      this.rb.velocity.x = input * this.speed;
    }

    if (Engine.input.getButtonDown('fire')) {
      this.fire();
    }
  }

  private fire(): void {
    if (!this.bulletPrefab) return;
    const bullet = Engine.instantiate(this.bulletPrefab);
    bullet.getComponent<Transform>('Transform')!.position = 
      this.transform.position.clone();
  }

  onCollisionEnter(other: Entity): void {
    if (other.hasComponent('Enemy')) {
      Engine.destroy(this.entity);
    }
  }
}
```

### 10.3. Component Communication Patterns

**Pattern 1: Direct Reference (Fast, Coupled)**
```typescript
const transform = this.getComponent<Transform>('Transform');
const otherTransform = this.world.getComponent<Transform>(otherEntity, 'Transform');
```

**Pattern 2: SignalBus (Decoupled, Flexible)**
```typescript
// Subscribe in onStart
this.signalBus.subscribe('game:score', this.onScore);

// Emit from anywhere
this.signalBus.emit('game:score', { points: 100 });
```

**Pattern 3: Query-Based (ECS-native)**
```typescript
// In a System
const enemies = world.query({ with: ['Transform', 'Enemy'] });
for (const enemy of enemies) {
  // Process all enemies
}
```

**Pattern 4: Service Locator (Singletons)**
```typescript
const gameManager = Engine.getService<GameManager>('GameManager');
gameManager.addScore(100);
```

### 10.4. Runtime Update Per Frame

```typescript
// In Engine.loop:
world.update(dt);

// World.update delegates to Systems in order:
for (const system of this.systems) {
  system.update(this, dt);
}

// ScriptSystem.update:
for (const [entity, script] of this.scripts) {
  if (script.enabled && script._instance) {
    script._instance.call('onUpdate', dt);
  }
}
```

**Scripts are updated in entity creation order** (deterministic). Users can set `script.executionOrder` to override.

---

## 11. Update Loop

```
requestAnimationFrame(timestamp)
│
├─ 1. Calculate dt
│     dt = (timestamp - lastTime) / 1000
│     clamp(dt, 0, 0.1) // Prevent spiral of death
│
├─ 2. Fixed timestep physics accumulator
│     physicsAccumulator += dt
│     while (physicsAccumulator >= FIXED_STEP) {
│       PhysicsSystem.step(FIXED_STEP)
│       physicsAccumulator -= FIXED_STEP
│     }
│
├─ 3. Input polling
│     InputSystem.update() // Keyboard, mouse, touch
│
├─ 4. Early scripts
│     ScriptSystem.call('onEarlyUpdate', dt)
│
├─ 5. Game logic systems
│     AnimationSystem.update(dt)
│     GameplaySystem.update(dt) // custom systems
│
├─ 6. Main scripts
│     ScriptSystem.call('onUpdate', dt)
│
├─ 7. Transform recalculation
│     TransformSystem.update(dt) // Dirty flag propagation
│
├─ 8. Camera update
│     CameraSystem.update(dt)
│
├─ 9. Late scripts
│     ScriptSystem.call('onLateUpdate', dt)
│
├─ 10. Audio update
│      AudioSystem.update(dt) // Spatial audio positioning
│
├─ 11. Render
│      RenderCoordinator.render(world)
│
└─ 12. Loop
       requestAnimationFrame(loop)
```

---

## 12. Event System (SignalBus)

### 12.1. Implementation

```typescript
class SignalBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe<T>(event: string, handler: (payload: T) => void, owner?: Entity): () => void {
    const set = this.listeners.get(event) ?? new Set();
    const listener = { handler, owner };
    set.add(listener);
    this.listeners.set(event, set);
    
    return () => set.delete(listener); // Unsubscribe function
  }

  unsubscribe<T>(event: string, handler: (payload: T) => void): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      if (listener.handler === handler) {
        set.delete(listener);
        break;
      }
    }
  }

  emit<T>(event: string, payload: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      try {
        listener.handler(payload);
      } catch (err) {
        console.error(`SignalBus error in ${event}:`, err);
      }
    }
  }

  // Auto-cleanup when entity is destroyed
  cleanupEntity(entity: Entity): void {
    for (const [event, set] of this.listeners) {
      for (const listener of set) {
        if (listener.owner === entity) set.delete(listener);
      }
    }
  }
}
```

### 12.2. Event Categories

| Namespace | Events | Emitter |
|---|---|---|
| `entity:*` | `created`, `destroyed`, `renamed` | World |
| `component:*` | `added`, `removed`, `changed` | World |
| `input:*` | `keydown`, `mousedown`, `touchstart` | InputSystem |
| `physics:*` | `collisionEnter`, `collisionExit`, `triggerEnter` | PhysicsSystem |
| `game:*` | `start`, `pause`, `score`, `levelComplete` | Game scripts |
| `editor:*` | `selectionChanged`, `undo`, `redo` | Editor |
| `network:*` | `peerJoined`, `peerLeft`, `sync` | Network layer |

---

## 13. Serialization Format

### 13.1. Scene JSON Schema

```json
{
  "version": "1.0.0",
  "id": "scene-uuid",
  "name": "Level 1",
  "entities": [
    {
      "id": "entity-uuid-1",
      "name": "Player",
      "components": {
        "Transform": {
          "position": [0, 0, 0],
          "rotation": [0, 0, 0, 1],
          "scale": [1, 1, 1]
        },
        "Hierarchy": {
          "parent": null,
          "children": ["entity-uuid-2"]
        },
        "SpriteRenderer": {
          "spriteId": "asset-uuid-abc",
          "tint": "#ffffff",
          "opacity": 1,
          "layer": 0
        },
        "Rigidbody2D": {
          "bodyType": "dynamic",
          "mass": 1,
          "gravityScale": 1
        },
        "Script": {
          "scriptId": "asset-uuid-script",
          "enabled": true,
          "properties": {
            "speed": 5,
            "jumpForce": 10
          }
        }
      }
    }
  ],
  "systems": ["RenderSystem2D", "PhysicsSystem2D", "ScriptSystem"],
  "assets": ["asset-uuid-abc", "asset-uuid-script"],
  "settings": {
    "gravity": [0, -9.8, 0],
    "physics2DGravity": [0, -9.8],
    "rendering": {
      "backgroundColor": "#000000",
      "ambientLight": "#333333"
    }
  }
}
```

### 13.2. Binary Runtime Format

For playable ad export, JSON is too verbose. The export pipeline compiles scenes to MessagePack or a custom binary format:

```typescript
function sceneToBinary(scene: SceneJSON): ArrayBuffer {
  // Entities as flat array
  // Components stored by type (SoA - Structure of Arrays)
  // Strings interned to lookup table
  // Numbers as Float32Array
}
```

---

## 14. Networking / Realtime Sync

### 14.1. Dual Collaboration Model

**Model A: Figma-style Realtime (Yjs CRDT)**
- Every keystroke, drag, and property change is synced via Yjs.
- Zero conflict resolution UI — automatic convergence.
- Cursor positions and selections shared via Yjs awareness.

**Model B: Git-style Versioning**
- Scenes are versioned with semantic commits.
- Branch, merge, diff — targeted at release management.
- Each "publish" creates an immutable playable ad snapshot.

### 14.2. Yjs Integration

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

class CollaborationSession {
  private doc: Y.Doc;
  private provider: WebsocketProvider;
  private sceneMap: Y.Map<Y.Map<any>>;

  constructor(roomId: string, serverUrl: string) {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(serverUrl, roomId, this.doc);
    this.sceneMap = this.doc.getMap('scene');
    
    // Sync ECS changes → Yjs
    this.signalBus.subscribe('component:changed', this.onComponentChanged);
    
    // Sync Yjs changes → ECS
    this.sceneMap.observe(this.onYjsChange);
  }

  private onComponentChanged = ({ entity, type, data }: any) => {
    const entityMap = this.sceneMap.get(entity.toString()) ?? new Y.Map();
    entityMap.set(type, JSON.stringify(data));
    this.sceneMap.set(entity.toString(), entityMap);
  };

  private onYjsChange = (event: Y.YMapEvent<any>) => {
    event.changes.keys.forEach((change, key) => {
      if (change.action === 'update') {
        const entityId = parseInt(key);
        const entityMap = this.sceneMap.get(key) as Y.Map<string>;
        // Apply to local ECS world...
      }
    });
  };
}
```

### 14.3. Backend (Node.js)

```typescript
// server/src/server.ts
import { Server } from 'socket.io';
import { setupWSConnection } from 'y-websocket/bin/utils';

const io = new Server(3000);

// Yjs document rooms
io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId as string;
  socket.join(roomId);
  
  // Setup Yjs over WebSocket
  setupWSConnection(socket as any, null, { docName: roomId });
  
  // Presence
  socket.on('awareness', (data) => {
    socket.to(roomId).emit('awareness', data);
  });
});
```

### 14.4. Conflict Resolution

CRDT handles concurrent edits automatically. Edge cases:
- **Same property edited simultaneously**: Last-writer-wins (Y.Map behavior).
- **Entity deleted while being edited**: Tombstone markers; undelete possible.
- **Asset referenced but deleted**: Soft delete + reference counting UI.

---

## 15. Performance Optimization

| Technique | Where | Impact |
|---|---|---|
| **Object Pooling** | Three.js meshes, Pixi sprites, physics bodies | Eliminates GC spikes |
| **Dirty Flags** | Transforms, bounds, matrices | O(changed) not O(n) |
| **Frustum Culling** | 3D renderer | Skip off-screen meshes |
| **Spatial Hashing** | 2D physics/collision | O(1) neighbor queries |
| **Texture Atlasing** | 2D sprites | Reduce draw calls |
| **Instancing** | Repeated 3D meshes | Single draw call |
| **LOD** | 3D models | Lower poly at distance |
| **Web Worker Compilation** | TS compiler | Non-blocking main thread |
| **WASM Physics** | Rapier | Near-native performance |
| **Request Animation Frame** | Render loop | Sync with display refresh |

---

## 16. Browser Optimization

### 16.1. Bundle Size Budgets

| Target | Size | Strategy |
|---|---|---|
| Engine core | <50KB | Custom ECS, no dependencies |
| Three.js (minimal) | <150KB | Import only `Scene`, `Camera`, `WebGLRenderer`, `Mesh`, `Material` |
| PixiJS (minimal) | <80KB | Import core + sprite |
| Planck.js | <80KB | Full lib (unavoidable) |
| Rapier WASM | <300KB | Lazy load only for 3D scenes |
| **Total runtime** | **<500KB** | Tree-shaken, gzipped |

### 16.2. Lazy Loading

```typescript
// Physics only loads when first Rigidbody is added
async function ensurePhysics(): Promise<void> {
  if (!physicsModule) {
    physicsModule = await import('./engine-physics-2d');
  }
}

// 3D renderer only loads when first MeshRenderer is added
async function ensure3DRenderer(): Promise<void> {
  if (!threeModule) {
    threeModule = await import('./engine-render-3d');
  }
}
```

### 16.3. Memory Management

- **Object pools** for particles, bullets, UI elements.
- **WeakMap caches** for entity → render object mappings.
- **Explicit dispose()** on scene unload: geometries, textures, materials.
- **Asset reference counting**: unload when no scene references an asset.

---

## 17. UI/UX Editor Design

### 17.1. Layout

```
┌──────────┬──────────────────────────────┬──────────┐
│  HIER-   │                              │ INSPECT- │
│  ARCHY   │                              │   OR     │
│  (Tree)  │        VIEWPORT              │ (Props)  │
│          │     (Play / Edit / 2D / 3D)  │          │
│          │                              │          │
├──────────┤                              ├──────────┤
│  ASSET   │                              │ SCRIPT   │
│  BROWSER │                              │ EDITOR   │
│  (Grid)  │                              │ (Monaco) │
└──────────┴──────────────────────────────┴──────────┘
         Toolbar (Play/Stop/Save/Undo/Redo)
```

### 17.2. Panels

- **Hierarchy**: Virtualized tree (react-window). Drag-and-drop reparenting. Multi-select.
- **Viewport**: 
  - 3D: `react-three-fiber` `<Canvas>` with `drei` gizmos (TransformControls).
  - 2D: `react-pixi` stage with overlay handles.
  - Toolbar: Play/Stop/Pause, 2D/3D toggle, camera presets.
- **Inspector**: Auto-generated form from component schema. Property drawers for Vec3, Color, EntityReference, AssetReference.
- **Asset Browser**: Virtualized grid. Drag to viewport to instantiate. Search/filter by type.
- **Script Editor**: Monaco with TypeScript LSP. IntelliSense for engine API. Errors highlighted.

### 17.3. Interaction Patterns

| Action | Behavior |
|---|---|
| Drag asset to viewport | Instantiate prefab / create sprite mesh |
| Drag entity in hierarchy | Reparent |
| Drag gizmo in viewport | Update Transform (live sync to Inspector) |
| Edit property in Inspector | Update component (live sync to viewport) |
| Multi-select | Bulk property edit (indeterminate state shown as `-`) |
| Undo | Revert last command (Command pattern) |
| Play | Clone world, switch to Runtime loop |

---

## 18. Frontend / Backend Architecture

### 18.1. Frontend

```
editor-ui/
├── src/
│   ├── App.tsx              # Shell, layout management
│   ├── store/
│   │   ├── useEditorStore.ts   # Zustand: selection, mode, viewport
│   │   └── useProjectStore.ts  # Zustand: project meta, scenes
│   ├── panels/
│   │   ├── HierarchyPanel.tsx
│   │   ├── InspectorPanel.tsx
│   │   ├── AssetBrowserPanel.tsx
│   │   └── ScriptEditorPanel.tsx
│   ├── viewport/
│   │   ├── Viewport3D.tsx   # r3f canvas
│   │   ├── Viewport2D.tsx   # react-pixi stage
│   │   └── GizmoOverlay.tsx
│   └── engine-bridge/
│       ├── EngineContext.tsx   # React Context for Engine instance
│       └── useEngine.ts        # Hook to access ECS from UI
```

### 18.2. Backend

```
server/
├── src/
│   ├── auth/
│   │   └── clerk.ts         # JWT validation
│   ├── rooms/
│   │   ├── RoomManager.ts   # WebSocket room lifecycle
│   │   └── YjsProvider.ts   # CRDT document hosting
│   ├── projects/
│   │   ├── ProjectService.ts
│   │   └── SceneService.ts
│   ├── assets/
│   │   ├── AssetService.ts
│   │   └── StorageService.ts # S3 abstraction
│   └── export/
│       └── ExportBuilder.ts  # Bundles playable ad
```

---

## 19. Database Schema

### 19.1. PostgreSQL

```sql
-- Users managed by Clerk/Auth0; we only store metadata
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  data JSONB NOT NULL,           -- Scene JSON
  version INTEGER DEFAULT 1,      -- Git-style version
  parent_version UUID,            -- For branching
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size_bytes INTEGER,
  storage_key TEXT NOT NULL,      -- S3 key
  metadata JSONB,                 -- width, height, duration, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  compiled TEXT,                  -- Cached compiled JS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  scene_id UUID REFERENCES scenes(id),
  format TEXT CHECK (format IN ('playable-ad', 'zip', 'embed')),
  storage_key TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 19.2. Redis

```
Keys:
- session:{jwt} → user metadata (TTL 24h)
- presence:{roomId} → { userId, cursor, selection }
- rate_limit:{userId}:{action} → counter (TTL 1h)
- cache:asset:{guid} → binary blob (TTL 1h)
```

---

## 20. AI Integration

### 20.1. Features

1. **Prompt → Scene**: 
   - Input: "A platformer level with 5 enemies and a boss at the end"
   - LLM generates Scene JSON → engine instantiates entities.
   - Backend proxies OpenAI/Claude API with structured output (JSON schema).

2. **Prompt → Script**:
   - Input: "Make the player jump when space is pressed"
   - LLM generates TypeScript Script class → inserted into Script component.

3. **Asset Generation**:
   - Input: "A red enemy sprite, 64x64, pixel art style"
   - Backend calls Stable Diffusion / DALL-E → returns PNG → auto-import.

4. **Smart Inspector**:
   - LLM suggests values based on context.
   - Example: User sets "bodyType = dynamic" → LLM suggests "mass = 1, gravityScale = 1".

### 20.2. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Editor    │────▶│  AI Service  │────▶│  OpenAI/    │
│  (Prompt)   │     │  (Node.js)   │     │  Claude API │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  JSON Schema │
                    │  Validation  │
                    └──────────────┘
```

**Security**: AI service is backend-only. API keys never exposed to client.

---

## 21. Security & Scalability

### 21.1. Script Sandboxing

User scripts cannot access:
- `window`, `document`, `localStorage`
- `fetch`, `XMLHttpRequest` (use `Engine.network` API instead)
- `eval`, `Function constructor`

They can access:
- `Engine.*` APIs (world, input, signalBus, instantiate, destroy)
- `Math`, `Date`, `JSON`, `console`
- Custom script imports (whitelisted)

**Implementation**: Scripts run in an `iframe` with `sandbox="allow-scripts"` and a `postMessage` bridge. Or use `quickjs-emscripten` for a true JS VM sandbox.

### 21.2. Rate Limiting

| Endpoint | Limit |
|---|---|
| AI generation | 10 req/min per user |
| Export build | 5 req/min per user |
| WebSocket messages | 100 msg/sec per connection |
| Asset upload | 50MB/min per user |

### 21.3. Horizontal Scaling

- **Stateless API**: Node.js backend can scale horizontally behind a load balancer.
- **WebSocket sharding**: `socket.io-redis-adapter` distributes rooms across instances.
- **Yjs persistence**: Documents saved to DB every 30s; in-memory only during active sessions.

---

## 22. Deployment Strategy

### 22.1. Infrastructure

```
┌─────────────────┐
│   CloudFlare    │  CDN + DDoS protection
│      CDN        │
└────────┬────────┘
         │
┌────────▼────────┐
│   Vercel /      │  Static SPA (Editor UI)
│  Cloudflare     │
│     Pages       │
└─────────────────┘
         │ API + WS
┌────────▼────────┐
│   Railway /     │  Node.js backend (Docker)
│    Render       │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Supabase│ │ AWS S3 │
│  PgSQL │ │ Assets │
└────────┘ └────────┘
    │
    ▼
┌────────┐
│ Redis  │
│(Upstash)│
└────────┘
```

### 22.2. CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: vercel --prod
```

### 22.3. Playable Ad Export Hosting

Exported games are:
1. Uploaded to S3 with `Content-Type: text/html`.
2. Served via CloudFlare CDN with aggressive caching.
3. Embedded via `<iframe>` on ad networks.

---

## 23. Tech Stack Summary

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React 19, TypeScript 5.6 | Mature, large ecosystem |
| **State** | Zustand | Lightweight, no boilerplate |
| **UI** | Radix UI + Tailwind CSS | Accessible, customizable |
| **3D Viewport** | Three.js + react-three-fiber | Declarative, React-native |
| **3D Helpers** | drei | Gizmos, cameras, controls |
| **2D Viewport** | PixiJS v8 + @pixi/react | Fast batching, React bindings |
| **Physics 2D** | Planck.js | Box2D accuracy, TS-native |
| **Physics 3D** | Rapier (WASM) | Best-in-class performance |
| **ECS** | Custom | Minimal size, full control |
| **Scripting** | Monaco Editor + TS compiler | Full IDE in browser |
| **Collaboration** | Yjs + y-websocket | Battle-tested CRDT |
| **Backend** | Node.js + Fastify | Fast, TS-friendly |
| **WS** | socket.io | Rooms, fallback transports |
| **Auth** | Clerk | SSO, MFA, low code |
| **DB** | PostgreSQL (Supabase) | Relational, JSON support |
| **Cache** | Redis (Upstash) | Sessions, rate limiting |
| **Storage** | AWS S3 / MinIO | Asset blobs |
| **AI** | OpenAI/Claude API | Best reasoning/models |
| **Export** | esbuild + Rollup | Fast bundling, tree-shaking |
| **Deploy** | Vercel + Railway | Serverless + containers |

---

## 24. MVP Phase Plan

### Phase 1: Foundation (Weeks 1–4)
- [ ] Custom ECS core (World, Entity, Component, System, Query)
- [ ] Math library (Vec2, Vec3, Quat, Mat4)
- [ ] SignalBus event system
- [ ] Scene serialization (JSON) + deep clone
- [ ] Basic React editor shell (panels, dockable layout)

### Phase 2: Rendering (Weeks 5–8)
- [ ] Three.js integration (3D viewport, camera, mesh renderer)
- [ ] PixiJS integration (2D viewport, sprite renderer)
- [ ] Transform system with dirty flags
- [ ] Hierarchy panel + drag-and-drop reparenting
- [ ] Inspector panel with auto-generated forms

### Phase 3: Scripting & Physics (Weeks 9–12)
- [ ] Monaco Editor integration
- [ ] TS compiler in Web Worker
- [ ] Script VM + lifecycle (onStart, onUpdate, onDestroy)
- [ ] Planck.js 2D physics
- [ ] Rapier 3D physics (WASM loading)
- [ ] Play Mode / Edit Mode switch with snapshot

### Phase 4: Assets & Export (Weeks 13–16)
- [ ] Asset manager + import pipeline
- [ ] Asset browser panel
- [ ] Prefab system
- [ ] Export to single HTML playable ad
- [ ] Audio system (Web Audio API)

### Phase 5: Collaboration (Weeks 17–20)
- [ ] Backend API (projects, scenes, assets)
- [ ] Yjs CRDT integration
- [ ] Real-time cursor/selection sync
- [ ] Git-style versioning (branch, commit, diff)
- [ ] Auth (Clerk)

### Phase 6: Polish & AI (Weeks 21–24)
- [ ] Animation system (tween + sprite sheet)
- [ ] Particle system
- [ ] AI prompt → scene/script
- [ ] Performance optimization (object pools, culling)
- [ ] Mobile viewport touch controls

---

## 25. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Bundle size exceeds 2MB** | High | Aggressive tree-shaking, lazy loading, custom ECS |
| **WASM physics fails on mobile** | Medium | Fallback to Cannon-es (pure JS) |
| **CRDT sync too slow for large scenes** | Medium | Binary Yjs updates, delta compression |
| **TS compilation too slow in browser** | Medium | Web Workers, caching compiled scripts |
| **WebGL performance on low-end** | Medium | WebGPU renderer as future upgrade |
| **Scope creep (wants Unity features)** | High | Strict MVP gates, user testing at Phase 4 |

---

*Document generated by PlayableWeb Brainstorm Session — 2026-05-23*
*Approach: Hybrid Renderer (Three.js + PixiJS) | ECS: Custom Sparse-Set | Collaboration: Yjs CRDT + Git Versioning*

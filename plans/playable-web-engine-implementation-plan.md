# PlayableWeb Engine — Modular Implementation Plan

**Version**: 1.0  
**Date**: 2026-05-23  
**Status**: Ready for execution  
**Derived from**: `plans/reports/playable-web-engine-design.md`

---

## 1. Plan Philosophy

The original 6-phase/24-week design doc is reorganized into **22 small, vertical-slice modules**. Each module:

- Is independently completable and testable.
- Produces a working, verifiable deliverable.
- Has clear inputs (dependencies on previous modules) and outputs (artifacts for downstream modules).
- Targets 1–5 days of effort (S = ~1 day, M = ~3 days, L = ~1 week).

**Vertical slicing** means we build one narrow feature end-to-end before adding the next, rather than building all horizontal layers at once. This keeps the system in a runnable state after every module.

---

## 2. Monorepo Structure

```
PlayableWeb/
├── packages/
│   ├── @pwe/math                    (Module 1)
│   ├── @pwe/ecs-core                (Module 2)
│   ├── @pwe/signalbus               (Module 3)
│   ├── @pwe/serialize               (Module 4)
│   ├── @pwe/engine-core             (Module 5)
│   ├── @pwe/render-3d               (Module 6)
│   ├── @pwe/render-2d               (Module 7)
│   ├── @pwe/render-coordinator      (Module 8)
│   ├── @pwe/physics-2d              (Module 9)
│   ├── @pwe/physics-3d              (Module 10)
│   ├── @pwe/script-engine           (Module 11)
│   ├── @pwe/asset-manager           (Module 12)
│   ├── @pwe/audio                   (Module 13)
│   ├── @pwe/animation               (Module 14)
│   ├── @pwe/particle-system         (Module 15)
│   ├── @pwe/editor-shell            (Module 16)
│   ├── @pwe/editor-viewport         (Module 17)
│   ├── @pwe/editor-panels           (Module 18)
│   ├── @pwe/editor-engine-bridge    (Module 19)
│   ├── @pwe/export-runtime          (Module 20)
│   ├── @pwe/server-api              (Module 21)
│   └── @pwe/server-collaboration    (Module 22)
├── apps/
│   ├── editor/                      (Vite + React 19 app, consumes editor-* packages)
│   └── runtime-test/                (Minimal HTML page to test engine-core + renderers)
├── services/
│   └── server/                      (Fastify backend, consumes server-* packages)
└── tooling/
    ├── ts-config/                   (Shared TypeScript configs)
    ├── eslint-config/               (Shared ESLint configs)
    └── test-utils/                  (Shared vitest helpers + canvas mocks)
```

Each `packages/@pwe/*` directory is an independent npm package with its own:
- `package.json` (type: module, exports map)
- `tsconfig.json` (extends shared base)
- `vitest.config.ts` (unit tests)
- `src/` and `dist/` (ESM + .d.ts output)

---

## 3. Module Dependency Graph

```
Module 1: Math
    │
    ▼
Module 2: ECS Core ◄────────────────────────────────────────┐
    │                                                       │
    ├──► Module 3: SignalBus ───────────────────────────────┤
    │                                                       │
    ├──► Module 4: Serialize ───────────────────────────────┤
    │                                                       │
    └──► Module 5: Engine Core (combines 2+3+4) ◄───────────┘
              │
              ├──► Module 6: Render 3D (Three.js)
              │
              ├──► Module 7: Render 2D (PixiJS)
              │
              ├──► Module 8: Render Coordinator (combines 6+7)
              │
              ├──► Module 9: Physics 2D (Planck.js)
              │
              ├──► Module 10: Physics 3D (Rapier WASM)
              │
              ├──► Module 11: Script Engine (Monaco + TS worker + VM)
              │
              ├──► Module 12: Asset Manager
              │
              ├──► Module 13: Audio (Web Audio API)
              │
              ├──► Module 14: Animation (tween + sprite sheet)
              │
              └──► Module 15: Particle System
                        │
                        ▼
              Module 16: Editor Shell (React 19 + Zustand + layout)
                        │
              Module 17: Editor Viewport (r3f + react-pixi)
                        │
              Module 18: Editor Panels (Hierarchy, Inspector, Asset Browser, Script)
                        │
              Module 19: Editor Engine Bridge (connects React UI to Engine Core)
                        │
              Module 20: Export Runtime (Rollup bundler → single HTML)
                        │
              Module 21: Server API (Fastify + PostgreSQL + S3)
                        │
              Module 22: Server Collaboration (Yjs + WebSocket + Git-style versioning)
```

---

## 4. Module Specifications

### Module 1: Math Library

| | |
|---|---|
| **Package** | `@pwe/math` |
| **Effort** | S (~1 day) |
| **Dependencies** | None |
| **Description** | Lightweight linear algebra: Vec2, Vec3, Quat, Mat4, Color. No external deps. |
| **Output** | Tree-shakeable ESM module with full test coverage. |
| **Testable Deliverable** | `npm test` passes for all operations (add, sub, mul, dot, cross, inverse, transpose, slerp, lerp). |
| **API Surface** | `Vec2`, `Vec3`, `Quat`, `Mat4`, `Color` classes with immutable operations and `toArray`/`fromArray` for renderer interop. |

---

### Module 2: ECS Core

| | |
|---|---|
| **Package** | `@pwe/ecs-core` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/math` (for component data types like Vec3) |
| **Description** | Sparse-set ECS: World, Entity (uint32 recycled), Component storage, System, Query. Archetype-free for fast structural changes in editor. |
| **Output** | Working ECS with create/destroy entity, add/remove/get component, query with `with`/`without`, system registration and execution order. |
| **Testable Deliverable** | `npm test` passes: 1000 entities created/destroyed, component add/remove, query correctness, system update order, free-list recycling. |
| **API Surface** | `World`, `System`, `Query`, `Entity` type alias. |
| **Key Decisions** | Use `Map<ComponentTypeId, Map<Entity, Component>>` sparse storage. Query optimization: start with smallest component set. |

---

### Module 3: SignalBus

| | |
|---|---|
| **Package** | `@pwe/signalbus` |
| **Effort** | S (~1 day) |
| **Dependencies** | `@pwe/ecs-core` (for Entity owner in auto-cleanup) |
| **Description** | Type-safe pub/sub event bus with auto-cleanup on entity destroy. |
| **Output** | `SignalBus` class with `subscribe`, `unsubscribe`, `emit`, `cleanupEntity`. |
| **Testable Deliverable** | `npm test` passes: subscribe/emit/unsubscribe, error isolation per handler, auto-cleanup when entity destroyed. |
| **API Surface** | `SignalBus.subscribe(event, handler, owner?) -> unsubscribeFn` |

---

### Module 4: Serialize

| | |
|---|---|
| **Package** | `@pwe/serialize` |
| **Effort** | S (~2 days) |
| **Dependencies** | `@pwe/ecs-core`, `@pwe/math` |
| **Description** | Scene JSON serialization and deep clone. Converts World to/from JSON. Handles component schema versioning. |
| **Output** | `Serializer` class with `world.toJSON()` and `World.fromJSON(json)`. |
| **Testable Deliverable** | `npm test` passes: round-trip serialize/deserialize produces identical world state, deep clone isolates mutations, handles unknown component types gracefully. |
| **API Surface** | `Serializer.serialize(world): SceneJSON`, `Serializer.deserialize(json): World` |

---

### Module 5: Engine Core

| | |
|---|---|
| **Package** | `@pwe/engine-core` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/ecs-core`, `@pwe/signalbus`, `@pwe/serialize`, `@pwe/math` |
| **Description** | Combines ECS + SignalBus + Serialize into the engine entry point. Adds `Engine` class with RAF loop, play/edit mode, and `InputManager`. |
| **Output** | `Engine` class that can run a standalone game loop with no renderer. |
| **Testable Deliverable** | `npm test` passes: engine starts/stops, play/edit mode switch with snapshot/restore, delta time clamping, input polling mocked. |
| **API Surface** | `Engine`, `EngineConfig`, `InputManager`, `Engine.start()`, `Engine.stop()`, `Engine.setMode('edit' \| 'play')` |

---

### Module 6: Render 3D (Three.js)

| | |
|---|---|
| **Package** | `@pwe/render-3d` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/engine-core`, `three` (peer dependency) |
| **Description** | Three.js integration: `ThreeRenderSystem` syncs ECS entities with `Transform` + `MeshRenderer`/`Camera`/`Light` to a Three.js scene. |
| **Output** | Render system that produces a WebGL2 frame from ECS world state. |
| **Testable Deliverable** | `apps/runtime-test/` displays a rotating cube (ECS entity with Transform + MeshRenderer). `npm test` passes: entity add/remove syncs Three.js objects, transform matrix updates, camera projection correct. |
| **API Surface** | `ThreeRenderSystem`, `MeshRenderer`, `Camera`, `Light` components |

---

### Module 7: Render 2D (PixiJS v8)

| | |
|---|---|
| **Package** | `@pwe/render-2d` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/engine-core`, `pixi.js` (peer dependency) |
| **Description** | PixiJS v8 integration: `PixiRenderSystem` syncs ECS entities with `Transform` + `SpriteRenderer` to a PixiJS stage. |
| **Output** | Render system that produces a 2D frame from ECS world state. |
| **Testable Deliverable** | `apps/runtime-test/` displays a moving sprite. `npm test` passes: sprite add/remove syncs Pixi display list, tint/opacity/flip applied, transform correct. |
| **API Surface** | `PixiRenderSystem`, `SpriteRenderer` component |

---

### Module 8: Render Coordinator

| | |
|---|---|
| **Package** | `@pwe/render-coordinator` |
| **Effort** | S (~1 day) |
| **Dependencies** | `@pwe/engine-core`, `@pwe/render-3d`, `@pwe/render-2d` |
| **Description** | Decides which renderers to activate based on scene contents. Handles mixed 2D+3D compositing (Pixi on transparent background over Three.js). |
| **Output** | `RenderCoordinator` class consumed by `Engine`. |
| **Testable Deliverable** | `apps/runtime-test/` shows a 3D scene with 2D HUD overlay. `npm test` passes: auto-detects 2D/3D presence, composites correctly, disposes resources on teardown. |
| **API Surface** | `RenderCoordinator`, `RenderCoordinator.render(world)` |

---

### Module 9: Physics 2D (Planck.js)

| | |
|---|---|
| **Package** | `@pwe/physics-2d` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/engine-core`, `planck-js` (peer dependency) |
| **Description** | Planck.js integration: `PhysicsSystem2D` syncs ECS `Transform`/`Rigidbody2D`/`Collider2D` to a Box2D world, steps simulation, syncs back, emits collision events via SignalBus. |
| **Output** | Working 2D physics system with dynamic/static/kinematic bodies, box/circle/polygon colliders, and collision events. |
| **Testable Deliverable** | `apps/runtime-test/` shows a box falling onto a static platform. `npm test` passes: body creation, transform sync ECS->physics->ECS, collision enter/exit events, gravity scale. |
| **API Surface** | `PhysicsSystem2D`, `Rigidbody2D`, `Collider2D` components |

---

### Module 10: Physics 3D (Rapier WASM)

| | |
|---|---|
| **Package** | `@pwe/physics-3d` |
| **Effort** | M (~4 days) |
| **Dependencies** | `@pwe/engine-core`, `@dimforge/rapier3d-compat` (peer dependency) |
| **Description** | Rapier WASM integration: `PhysicsSystem3D` syncs ECS `Transform`/`Rigidbody`/`Collider` to Rapier world. Lazy-loads WASM only when first rigidbody added. |
| **Output** | Working 3D physics system with box/sphere/capsule/mesh colliders and collision events. |
| **Testable Deliverable** | `apps/runtime-test/` shows a sphere falling onto a box. `npm test` passes: WASM init, body sync, collision events, mesh collider from asset GUID. |
| **API Surface** | `PhysicsSystem3D`, `Rigidbody`, `Collider` components |

---

### Module 11: Script Engine

| | |
|---|---|
| **Package** | `@pwe/script-engine` |
| **Effort** | L (~1 week) |
| **Dependencies** | `@pwe/engine-core`, `@pwe/asset-manager` (for script source loading) |
| **Description** | Monaco Editor integration (later), TS compiler in Web Worker, sandboxed VM (iframe or quickjs-emscripten), Script component lifecycle (`onStart`, `onUpdate`, `onDestroy`, `onCollisionEnter`). |
| **Output** | `ScriptEngine` that compiles user TS to JS and mounts it as `ScriptInstance` on entities. |
| **Testable Deliverable** | `apps/runtime-test/` runs a user script that moves an entity with arrow keys. `npm test` passes: TS compilation in worker, sandbox isolation (no window/document access), lifecycle callbacks fire in correct order, `@property` deserialization. |
| **API Surface** | `ScriptEngine`, `Script`, `ScriptInstance`, `property` decorator |

---

### Module 12: Asset Manager

| | |
|---|---|
| **Package** | `@pwe/asset-manager` |
| **Effort** | M (~4 days) |
| **Dependencies** | `@pwe/engine-core` (for SignalBus events) |
| **Description** | Virtual file system with GUIDs, importer pipeline (texture -> WebP, audio -> AudioBuffer, mesh -> BufferGeometry, script -> raw source), addressable-like loading, reference counting. |
| **Output** | `AssetManager` with `import(file)`, `load<T>(guid)`, `unload(guid)`. |
| **Testable Deliverable** | `npm test` passes: import generates GUID, load caches imported data, unload frees memory, reference counting prevents premature unload, texture/mesh/audio/script importers produce correct types. |
| **API Surface** | `AssetManager`, `Asset`, `Importer` interface |

---

### Module 13: Audio

| | |
|---|---|
| **Package** | `@pwe/audio` |
| **Effort** | S (~2 days) |
| **Dependencies** | `@pwe/engine-core`, `@pwe/asset-manager` |
| **Description** | Web Audio API integration: `AudioSystem` manages `AudioSource` components (clip, volume, pitch, loop, spatial blend). |
| **Output** | Spatial and non-spatial audio playback synchronized with entity positions. |
| **Testable Deliverable** | `apps/runtime-test/` plays a looping sound when an entity is created. `npm test` passes: play/pause/stop, volume/pitch changes, spatial positioning updates with Transform, `playOnStart`. |
| **API Surface** | `AudioSystem`, `AudioSource` component |

---

### Module 14: Animation

| | |
|---|---|
| **Package** | `@pwe/animation` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/engine-core` |
| **Description** | Tween engine + sprite sheet animation. `Animator` component references an `AnimationClip` asset (keyframe data). `AnimationSystem` updates component properties over time. |
| **Output** | Keyframe animation for transforms, sprites, and arbitrary numeric properties. |
| **Testable Deliverable** | `apps/runtime-test/` shows a sprite scaling up and down in a loop. `npm test` passes: tween interpolation (linear, ease-in-out), sprite sheet frame advance, animation state machine (play/pause/transition). |
| **API Surface** | `AnimationSystem`, `Animator`, `AnimationClip` |

---

### Module 15: Particle System

| | |
|---|---|
| **Package** | `@pwe/particle-system` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/engine-core`, `@pwe/render-2d` (for sprite-based particles) |
| **Description** | Simple CPU particle emitter: position, velocity, lifetime, color over life, size over life. Renders via PixiJS sprites. |
| **Output** | `ParticleSystem` component that spawns and recycles sprite particles. |
| **Testable Deliverable** | `apps/runtime-test/` shows a burst of 50 particles. `npm test` passes: emitter spawns particles, particles update position/opacity/size, dead particles recycled, no memory leak after 1000 spawns. |
| **API Surface** | `ParticleSystem`, `ParticleEmitter` |

---

### Module 16: Editor Shell

| | |
|---|---|
| **Package** | `@pwe/editor-shell` |
| **Effort** | M (~3 days) |
| **Dependencies** | React 19, Zustand, Tailwind CSS, Radix UI |
| **Description** | React application shell: dockable panel layout (via `react-resizable-panels` or similar), dark theme, toolbar (Play/Stop/Undo/Redo), Zustand stores for selection/mode/viewport. |
| **Output** | Running Vite app with empty panels and a working toolbar. |
| **Testable Deliverable** | `apps/editor/` starts with `npm run dev`, shows 4 resizable panel regions + toolbar, Play button toggles state in Zustand store. `npm test` passes: panel resize persists, toolbar actions dispatch store updates. |
| **API Surface** | `useEditorStore`, `useProjectStore`, `App.tsx`, `Toolbar.tsx` |

---

### Module 17: Editor Viewport

| | |
|---|---|
| **Package** | `@pwe/editor-viewport` |
| **Effort** | M (~4 days) |
| **Dependencies** | `@pwe/editor-shell`, `@pwe/engine-core`, `@pwe/render-3d`, `@pwe/render-2d`, `react-three-fiber`, `@pixi/react` |
| **Description** | Viewport panels: 3D (r3f Canvas + drei's `TransformControls`) and 2D (react-pixi Stage + overlay handles). Camera controls (orbit, pan, zoom). Gizmo rendering. 2D/3D toggle. |
| **Output** | Viewport renders ECS world and allows transform manipulation via gizmos. |
| **Testable Deliverable** | `apps/editor/` shows a cube in 3D viewport; dragging the translate gizmo updates the entity's Transform component (verified in store). `npm test` passes: gizmo interaction updates ECS, camera controls work, 2D/3D mode switch. |
| **API Surface** | `Viewport3D`, `Viewport2D`, `GizmoOverlay`, `CameraControls` |

---

### Module 18: Editor Panels

| | |
|---|---|
| **Package** | `@pwe/editor-panels` |
| **Effort** | M (~4 days) |
| **Dependencies** | `@pwe/editor-shell`, `@pwe/engine-core` |
| **Description** | Four panels: Hierarchy (virtualized tree, drag-drop reparent, multi-select), Inspector (auto-generated forms from component schemas, property drawers for Vec3/Color/AssetRef), Asset Browser (virtualized grid, drag to viewport), Script Editor (Monaco with TS LSP + engine API types). |
| **Output** | All four panels functional and wired to Zustand store. |
| **Testable Deliverable** | `apps/editor/` passes E2E smoke: create entity in Hierarchy -> appears in viewport -> select -> edit Transform in Inspector -> viewport updates -> drag asset to viewport -> instantiate -> open Script Editor -> type TS with IntelliSense. `npm test` passes: Hierarchy tree operations, Inspector form binding, Asset Browser filtering. |
| **API Surface** | `HierarchyPanel`, `InspectorPanel`, `AssetBrowserPanel`, `ScriptEditorPanel` |

---

### Module 19: Editor Engine Bridge

| | |
|---|---|
| **Package** | `@pwe/editor-engine-bridge` |
| **Effort** | M (~3 days) |
| **Dependencies** | `@pwe/editor-shell`, `@pwe/editor-viewport`, `@pwe/editor-panels`, `@pwe/engine-core`, `@pwe/script-engine` |
| **Description** | Connects React UI to Engine Core: `EngineContext` provider, `useEngine` hook, play/edit mode transition (snapshot/clone/restore), undo/redo command pattern, live sync between Inspector and ECS. |
| **Output** | Editor is a fully functional live editor: create entities, edit components, press Play to test, Stop to revert. |
| **Testable Deliverable** | `apps/editor/` E2E: create scene -> add entity -> add SpriteRenderer -> drag sprite asset -> press Play -> sprite moves via script -> press Stop -> scene reverts to pre-play state. `npm test` passes: play/stop round-trip, undo/redo stack, command batching. |
| **API Surface** | `EngineContext`, `useEngine`, `Command`, `CommandHistory` |

---

### Module 20: Export Runtime

| | |
|---|---|
| **Package** | `@pwe/export-runtime` |
| **Effort** | M (~4 days) |
| **Dependencies** | `@pwe/engine-core`, `@pwe/render-3d`, `@pwe/render-2d`, `@pwe/physics-2d`, `@pwe/physics-3d`, `@pwe/script-engine`, `@pwe/asset-manager`, `@pwe/audio`, `@pwe/animation` |
| **Description** | Bundles a scene + engine + scripts + assets into a single HTML playable ad. Uses esbuild/Rollup to tree-shake, inlines assets as base64/DataURL, compiles TS scripts to JS. |
| **Output** | CLI tool and backend endpoint that produce `index.html` (<2MB). |
| **Testable Deliverable** | Export a simple scene -> open `index.html` in browser -> game runs without network requests. `npm test` passes: bundle size <2MB, tree-shaking excludes unused systems, asset inlining correct, script compilation included. |
| **API Surface** | `ExportBuilder`, `bundle(scene, options): Promise<Blob>` |

---

### Module 21: Server API

| | |
|---|---|
| **Package** | `@pwe/server-api` |
| **Effort** | M (~4 days) |
| **Dependencies** | Fastify, PostgreSQL, Redis, S3/MinIO, Clerk JWT validation |
| **Description** | REST API for projects, scenes, assets, scripts, exports. Auth via Clerk. File upload to S3. Rate limiting via Redis. |
| **Output** | Deployable Fastify server with OpenAPI spec. |
| **Testable Deliverable** | `services/server/` starts with `npm run dev`, passes integration tests: create project -> upload asset -> save scene -> list scenes -> export build -> rate limit enforced. `npm test` passes: all endpoints, auth rejection, CRUD operations. |
| **API Surface** | `/projects`, `/scenes`, `/assets`, `/scripts`, `/exports`, `/auth` |

---

### Module 22: Server Collaboration

| | |
|---|---|
| **Package** | `@pwe/server-collaboration` |
| **Effort** | L (~1 week) |
| **Dependencies** | `@pwe/server-api`, Yjs, y-websocket, socket.io |
| **Description** | Yjs CRDT document hosting over WebSocket, real-time cursor/selection sync, Git-style versioning (branch/commit/diff), presence via Redis. |
| **Output** | Multiplayer editing: two browser tabs editing same scene see live updates. Version history with rollback. |
| **Testable Deliverable** | Open two `apps/editor/` instances -> both edit same scene -> changes converge automatically -> create commit -> branch -> merge. `npm test` passes: CRDT convergence, presence broadcast, version tree operations. |
| **API Surface** | `CollaborationSession`, `YjsProvider`, `VersionControl` |

---

## 5. Execution Order

| Order | Module | Effort | Cumulative |
|-------|--------|--------|------------|
| 1 | Math | S (1d) | 1d |
| 2 | ECS Core | M (3d) | 4d |
| 3 | SignalBus | S (1d) | 5d |
| 4 | Serialize | S (2d) | 7d |
| 5 | Engine Core | M (3d) | 10d |
| 6 | Render 3D | M (3d) | 13d |
| 7 | Render 2D | M (3d) | 16d |
| 8 | Render Coordinator | S (1d) | 17d |
| 9 | Physics 2D | M (3d) | 20d |
| 10 | Physics 3D | M (4d) | 24d |
| 11 | Asset Manager | M (4d) | 28d |
| 12 | Script Engine | L (1wk) | 33d |
| 13 | Audio | S (2d) | 35d |
| 14 | Animation | M (3d) | 38d |
| 15 | Particle System | M (3d) | 41d |
| 16 | Editor Shell | M (3d) | 44d |
| 17 | Editor Viewport | M (4d) | 48d |
| 18 | Editor Panels | M (4d) | 52d |
| 19 | Editor Engine Bridge | M (3d) | 55d |
| 20 | Export Runtime | M (4d) | 59d |
| 21 | Server API | M (4d) | 63d |
| 22 | Server Collaboration | L (1wk) | 68d |

**Total estimated effort: ~14 weeks** (down from 24 weeks in original plan due to vertical slicing and parallelizable editor work after Module 15).

---

## 6. Risk Assessment

| Risk | Likelihood (1-5) | Impact (1-5) | Score | Mitigation |
|------|-----------------|--------------|-------|------------|
| Bundle size exceeds 2MB on export | 4 | 5 | 20 | Aggressive tree-shaking from day one; measure bundle size in Module 20 tests; lazy-load physics WASM |
| Rapier WASM fails on mobile browsers | 3 | 4 | 12 | Keep Cannon-es fallback path in Module 10 design; test on real devices early |
| TS compilation in Web Worker too slow | 3 | 3 | 9 | Cache compiled scripts by hash; incremental compilation; benchmark in Module 11 |
| CRDT sync lag on large scenes | 3 | 3 | 9 | Binary Yjs updates; delta compression; test with 1000+ entities in Module 22 |
| Scope creep (adding Unity-like features) | 4 | 4 | 16 | Strict module gates; no module expands beyond its spec without plan revision |
| React editor performance with large scenes | 3 | 3 | 9 | Virtualized lists from Module 16; memoized selectors in Zustand; profile after Module 19 |
| Physics-ECS sync bugs (desync) | 3 | 4 | 12 | Deterministic test scenarios in Modules 9-10; visual regression tests in runtime-test app |

**High risk (score >= 15):** Bundle size and scope creep. Mitigations are built into the module acceptance criteria.

---

## 7. Test Strategy

| Level | When | How |
|-------|------|-----|
| **Unit** | Every module | Vitest, run in `npm test` per package. Mock WebGL/Canvas where needed via `happy-dom` or `jsdom` + `vitest-canvas-mock`. |
| **Integration** | Modules 5, 8, 11, 12, 19, 20 | Combine 2-3 packages, test their interaction (e.g., Engine + Render 3D + Render 2D). |
| **Runtime Test App** | Modules 6, 7, 9, 10, 11, 13, 14, 15 | `apps/runtime-test/` is a minimal HTML page that exercises the module in a real browser. Verified manually + via Playwright screenshot diff. |
| **Editor E2E** | Modules 16-19 | `apps/editor/` is the full editor. Key user flows tested via Playwright (create entity, edit, play, stop, export). |
| **Backend Integration** | Modules 21-22 | Testcontainers (PostgreSQL + Redis + MinIO) via Vitest. Full API + WS flow tested. |

---

## 8. Definition of Done (Per Module)

Before marking any module complete:

1. [ ] All code written and typed (TypeScript strict mode, no `any`).
2. [ ] Unit tests pass (`npm test` in package directory).
3. [ ] Runtime test app updated (if applicable) and visually verified.
4. [ ] Bundle size measured and logged (if applicable).
5. [ ] Module exports are tree-shakeable (verified via `rollup-plugin-visualizer` or `esbuild --analyze`).
6. [ ] No circular dependencies within or across packages (verified via `madge`).
7. [ ] Documentation: `README.md` in package root with API surface and usage example.
8. [ ] Commit with scope `pwe-{module-name}`.

---

## 9. Cook Handoff

After this plan is approved, execute module by module using `/t1k:cook plans/playable-web-engine-implementation-plan.md --module {n}`.

Start with **Module 1: Math**.

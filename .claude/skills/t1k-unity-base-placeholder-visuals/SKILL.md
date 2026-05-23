---
name: t1k:unity:base:placeholder-visuals
description: Build playable demos without art assets — primitives + URP/Unlit + procedural materials + UI swatches. Includes a 12-point Playability Validation Checklist so you can prove a demo is actually playable. Use for POCs, prototypes, vertical slices, and gameplay-first demos before art lands.
effort: medium
context: fork
triggers:
  - placeholder
  - greybox
  - prototype
  - POC
  - vertical slice
  - no art
  - art-free
  - playable proof
  - demo visualization
  - primitive prefab
  - URP Unlit material
  - colored quad
  - GetOrCreateMaterial
  - Setup Scene
keywords: [placeholder, greybox, prototype, POC, demo, primitives, URP, validation]
version: 1.12.0
origin: theonekit-unity
repository: The1Studio/theonekit-unity
module: base
protected: false
---

# Placeholder Visuals — Playable Demos Without Art Assets

Build complete, validated, playable demos using only Unity primitives + URP shaders + procedural materials. Replace any placeholder with a real asset later without touching gameplay code — visuals are decoupled by design.

**SSOT for the pattern audit + per-perspective playbooks:** `references/`. **Treat the Playability Validation Checklist below as a release gate** — a demo that fails any P0 row is not playable.

## When to use

| Use it when... | Skip it when... |
|---|---|
| Building a vertical slice / POC / prototype | Shipping production with final art |
| Art team is downstream of gameplay | Synty/asset packs already wired and proven |
| You need to verify gameplay loops before committing to art | The demo already has all the validation rows green |
| Demoing a new system in isolation | The visuals issue is "make art prettier" — not "make game playable" |

## Core pattern (universal across 7 DOTS-AI demos audited)

1. **Primitives only** — `GameObject.CreatePrimitive(PrimitiveType.{Quad,Cube,Capsule,Cylinder,Sphere})`. No 3D models, no Synty.
2. **URP shaders** — `Universal Render Pipeline/Unlit` (2D / side / iso) or `Universal Render Pipeline/Lit` (3D). No custom shaders.
3. **Procedural materials saved to `.mat`** — `GetOrCreateMaterial(name, color)` writes once, reuses on re-runs. Naming `{Category}_{Subject}.mat` (e.g. `Item_MGCannon.mat`, `Enemy_ScrapRunner.mat`).
4. **Tool menu pair** — `Tools/{DemoName}/Create All Prefabs` + `Tools/{DemoName}/Setup Scene`. Always re-runnable.
5. **Idempotent destroy-by-name scene setup** — re-running setup MUST pick up authoring field changes. Never `if (exists) return` — always destroy and recreate.
6. **Partial-class file split** — keep every file under 200 lines. Split by responsibility: `.cs` (entry), `.SubScene.cs` (ECS authoring), `.UI.cs` (canvases), `.UI.HUD.cs`, `.UI.Shop.cs`, etc.
7. **Color-as-identity** — rarity tints (Common=grey, Rare=blue, Epic=purple, Legendary=gold), team tints (red/blue), archetype tints (scrap=orange-red, drone=dusty-red).
8. **Authoring components attached at prefab-creation time** — `instance.AddComponent<XxxAuthoring>()` then `PrefabUtility.SaveAsPrefabAsset` so bakers see the right SerializeField values.

## Perspective playbooks

Pick the matching playbook for the demo's perspective. Full details in `references/perspective-playbooks.md`.

| Perspective | Body primitive | Camera | Shader | Notable |
|---|---|---|---|---|
| **3D** (BattleDemo) | Capsule/Cylinder/Sphere + mesh-child pivot | Perspective | URP/Lit | LODGroup + Impostor fallback |
| **2D top-down** (BattleDemo2D) | Quad XZ-plane | Ortho top-down | URP/Unlit cutout | Alpha-clip 0.5 |
| **2D side-view** (RushTank, BattleDemoSideView) | Quad XY-plane | Ortho -Z | URP/Unlit | Tank rolls, world scrolls |
| **Isometric** (BattleDemoIso) | Quad + billboard shader | Perspective 30° tilt | Billboard shader | Auto-rotates to camera |

## Playability Validation Checklist (12 P0 rows — release gate)

A demo is **NOT playable** until every P0 row is green. Run this before declaring any demo "done".

### A. World readability (player can see what's happening)

- [ ] **P0-A1 Player avatar visible.** The player character/tank/unit is on screen at game start, NOT a single colored block — it has a recognizable silhouette built from 3+ primitives (body + tracks + turret, body + cape + head, etc.).
- [ ] **P0-A2 Enemies visually distinguishable.** Every enemy archetype reads at-a-glance from every other. NOT all red squares. Body shape + accent parts (barrel/spike/rotor/turret) per archetype.
- [ ] **P0-A3 Ground line + horizon backdrop.** Scene has at least 3 environment layers: ground bar, distant silhouettes (mountains/walls/objects), sky. NOT a solid-color void.
- [ ] **P0-A4 Items / pickups visible + distinct.** Each item type has a distinct color OR shape. NOT all identical squares.

### B. HUD (player knows the game state)

- [ ] **P0-B1 HP bar visible.** Player HP rendered as a slider with fill + numeric overlay. Updates on damage.
- [ ] **P0-B2 Phase / objective text visible.** Current phase (Arrange, Rolling, Combat, Shop, Won, Lost…) shown as on-screen text. Updates on phase change.
- [ ] **P0-B3 Currency / resource counters.** Scrap / Gold / XP / Cores — whatever the player earns, shown numerically with a label ("Scrap: 47", not just "47").

### C. Interaction (player knows what to do)

- [ ] **P0-C1 At least one clickable button per active phase.** Every screen the player faces MUST have at least one interactive control with a labeled action ("GO ▶", "REROLL", "EXIT SHOP", "NEW RUN ▶"). NOT silent screens that require unknown input.
- [ ] **P0-C2 Phase-intro feedback.** When a new phase starts, the player gets a visible signal — either a transient banner overlay ("ARRANGE — Drag items to tank") or a clear UI change. NO silent transitions.
- [ ] **P0-C3 End-state screens.** Win and Lose paths each show a dedicated panel with stats + a "New Run" button. NOT just "game ends, scene freezes".

### D. Setup / re-runability (other developers can run the demo)

- [ ] **P0-D1 One-button scene setup.** `Tools/{DemoName}/Setup Scene` builds the entire scene from scratch with zero Inspector touch-ups required. Re-runnable on every commit.
- [ ] **P0-D2 No null SerializeFields after setup.** Every `[SerializeField]` ref on every authoring/UI MonoBehaviour is wired by code via `SerializedObject` — Inspector should show zero `None (...)` slots after `Setup Scene`.

### Anti-patterns that FAIL the checklist

| Anti-pattern | Why it fails |
|---|---|
| Comment in setup code: "user wires refs in Inspector after re-running setup" | Fails P0-D2. The UI never renders because refs are null. **This shipped in RushTank — broke the whole demo until fixed.** |
| `Image` + `Text` on the same GameObject (constructed with `typeof(Image), typeof(Text)`) | Unity rejects — only one Graphic per GO. Use parent panel + child text. |
| Solid-color clear with no environment quads | Fails P0-A3. Player can't tell what's foreground vs background. |
| All enemies same Quad + same red material with only stat differences | Fails P0-A2. Player can't strategize. Add multi-part silhouettes. |
| Single-quad player avatar | Fails P0-A1. Compose 3+ primitives (body + tracks + turret). |
| Silent phase transitions | Fails P0-C2. Add a `RushTankPhaseBanner`-style overlay watching the phase singleton. |

## Gotchas

1. **Image + Text cannot share a GameObject.** Unity allows only one `UnityEngine.UI.Graphic`-derived component per GO. Panel-with-text → parent (Image) + child stretched (Text).
2. **`??` and `?.` are BANNED on `UnityEngine.Object`.** Unity's fake-null bypasses C# operators. Use `if (x == null)` explicitly.
3. **Setup Scene must be destroy-and-recreate, not skip-if-exists.** Otherwise newly added authoring fields never reach pre-existing GameObjects.
4. **Procedural prefabs need `PrefabUtility.SaveAsPrefabAsset` round-trip** so SerializeField changes persist. `AddComponent` then save then destroy the in-scene instance.
5. **Private SerializeField needs `SerializedObject.FindProperty` + `ApplyModifiedPropertiesWithoutUndo`.** Direct reflection works inconsistently.
6. **Material naming = swap-in surface.** Use `{Category}_{Subject}.mat` (e.g. `Enemy_Boss_Eye.mat`). When real art lands, the artist only swaps materials — gameplay code never changes.
7. **One Tool/Setup Scene menu per demo.** Don't share scene setups across demos. Each demo owns its prefab folder + materials folder + scene asset.

## Reference implementation

`Assets/Demos/RPG/RushTankDemo/` is the canonical example. Files to study:
- `Editor/RushTankPrefabCreator.cs` + `RushTankPrefabCreator.EnemyParts.cs` — primitive prefabs + multi-part silhouettes
- `Editor/RushTankSceneSetup.cs` + 9 partial files — scene wiring
- `Editor/RushTankSceneSetup.UI.HUD.cs` — HUD widget construction (slider, currency text, phase label, speed buttons, map button)
- `Editor/RushTankSceneSetup.Environment.cs` — ground/horizon/mountain backdrop
- `Editor/RushTankSceneSetup.SubScene.TankVisual.cs` — multi-part tank silhouette
- `Runtime/UI/RushTankPhaseBanner.cs` — phase intro overlay watching ECS singleton

Other strong references: BackpackCrawler (procedural pixel-art landscape — 4 PNG layers with X+Y wrap tiling), BattleDemo (LOD+Impostor fallback), BattleDemoIso (billboard shader).

See `references/` for: `playability-checklist.md` (auditor's worksheet), `perspective-playbooks.md` (4 perspectives), `demo-audit-2026-05-19.md` (7-demo consensus + divergence), `validation-script.md` (how to run the checklist via Unity MCP).

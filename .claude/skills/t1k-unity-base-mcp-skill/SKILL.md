---
name: t1k:unity:base:mcp-skill
description: Orchestrate Unity Editor via MCP tools — GameObjects, scripts, scenes, assets, tests, cameras, graphics, packages. Best practices and workflow patterns for Unity-MCP integration.
effort: high
context: fork
keywords: [MCP, unity MCP, tool, bridge]
version: 1.12.0
origin: theonekit-unity
repository: The1Studio/theonekit-unity
module: base
protected: false
---

# Unity-MCP Operator Guide

Use Unity Editor via MCP (Model Context Protocol) tools. Always read relevant resources before using tools.

## Template Notice

Examples in `references/` are reusable templates. Validate targets/components first; treat names, enum values, and property payloads as placeholders to adapt.

## Resource-First Workflow

```
1. Check editor state     → mcpforunity://editor/state
2. Understand the scene   → mcpforunity://scene/gameobject-api
3. Find what you need     → find_gameobjects or resources
4. Take action            → tools (manage_gameobject, create_script, etc.)
5. Verify results         → read_console, capture_screenshot, resources
```

## Critical Best Practices

**After writing/editing scripts — always refresh and check console:**
```python
refresh_unity(mode="force", scope="scripts", compile="request", wait_for_ready=True)
read_console(types=["error"], count=10, include_stacktrace=True)
```

## ⛔ Forbidden — `Assets/Reimport All`

**NEVER call `execute_menu_item(menu_path="Assets/Reimport All")` or any equivalent (`AssetDatabase.Refresh(ImportAssetOptions.ForceUpdate)`, etc.).**

Why it is forbidden:
- Triggers a from-scratch reimport of every asset in the project (textures, models, shaders, scripts, audio, prefabs). On a non-trivial project this is **30+ minutes** of CPU/GPU work and **multiple shader compiler workers** spawn.
- **Cannot be cancelled from MCP** once issued — Unity processes the queue regardless of subsequent commands. The MCP bridge typically goes unresponsive while the reimport runs.
- The legitimate reason to use it (rebuilding stale Burst caches or recovering from a corrupted asset DB) is satisfied by the **targeted** alternatives below at a fraction of the cost.

When you think you need Reimport All, you actually want one of these:

| Goal | Correct command |
|---|---|
| Recompile scripts after edits | `refresh_unity(mode="force", scope="scripts", compile="request", wait_for_ready=True)` |
| Re-bake DOTS SubScenes after entity-type changes | `rm -rf Library/EntityScenes/` then enter Play mode |
| Clear stale Burst cache after type changes | `rm -rf Library/BurstCache Library/Bee/artifacts Library/ScriptAssemblies` then `refresh_unity` |
| Reimport ONE asset (texture, model, prefab) | `manage_asset(action="reimport", path="Assets/...")` |
| Recover from "everything looks broken" | Restart the Unity Editor (faster than Reimport All) |

**Hard rule:** The only path to legitimately calling Reimport All is (1) the user issues a direct order to do so, OR (2) a referenced document explicitly requires it for a specific recovery procedure. If neither applies, do not call it. If you are about to call it, stop and choose one of the targeted alternatives above.

**Use `batch_execute` for multiple operations (10–100x faster):**
```python
batch_execute(commands=[...], parallel=True)  # Max 25 per batch (configurable, max 100)
```

**Screenshots for visual verification:**
```python
manage_scene(action="screenshot", include_image=True, max_resolution=512)
manage_scene(action="screenshot", batch="surround", look_at="Player", max_resolution=256)
```

**Always check `editor_state` before complex operations** — wait if `is_compiling=true` or `is_domain_reload_pending=true`.

## ⛔ Forbidden — `Assets/Reimport All`

**NEVER call `execute_menu_item(menu_path="Assets/Reimport All")` or any equivalent (`AssetDatabase.Refresh(ImportAssetOptions.ForceUpdate)`, etc.).**

Why it is forbidden:
- Triggers a from-scratch reimport of every asset in the project (textures, models, shaders, scripts, audio, prefabs). On a non-trivial project this is **30+ minutes** of CPU/GPU work and **multiple shader compiler workers** spawn.
- **Cannot be cancelled from MCP** once issued — Unity processes the queue regardless of subsequent commands. The MCP bridge typically goes unresponsive while the reimport runs.
- The legitimate reason to use it (rebuilding stale Burst caches or recovering from a corrupted asset DB) is satisfied by the **targeted** alternatives below at a fraction of the cost.

When you think you need Reimport All, you actually want one of these:

| Goal | Correct command |
|---|---|
| Recompile scripts after edits | `refresh_unity(mode="force", scope="scripts", compile="request", wait_for_ready=True)` |
| Re-bake DOTS SubScenes after entity-type changes | `rm -rf Library/EntityScenes/` then enter Play mode |
| Clear stale Burst cache after type changes | `rm -rf Library/BurstCache Library/Bee/artifacts Library/ScriptAssemblies` then `refresh_unity` |
| Reimport ONE asset (texture, model, prefab) | `manage_asset(action="reimport", path="Assets/...")` |
| Recover from "everything looks broken" | Restart the Unity Editor (faster than Reimport All) |

**Hard rule:** The only path to legitimately calling Reimport All is (1) the user issues a direct order to do so, OR (2) a referenced document explicitly requires it for a specific recovery procedure. If neither applies, do not call it. If you are about to call it, stop and choose one of the targeted alternatives above.

## 🔧 Install / Re-Install — Always The1Studio Fork on `beta`

UnityMCP must be registered from the The1Studio fork on the `beta` branch — never the upstream PyPI package `mcpforunityserver`, never any other branch. This matches the Unity-side UPM submodule (`Packages/com.coplaydev.unity-mcp/`), which is pinned to the same fork+branch.

**Canonical install (user scope so it survives across projects):**

```bash
# Idempotent — clear any prior bad config in either scope first.
claude mcp remove UnityMCP -s user  || true
claude mcp remove UnityMCP -s local || true

claude mcp add UnityMCP -s user -- \
  uvx --from "git+https://github.com/The1Studio/unity-mcp.git@beta#subdirectory=Server" \
  mcp-for-unity
```

**Always verify after install** (both commands, same turn):

```bash
claude mcp get UnityMCP   # expect: ✓ Connected, Scope: User config, Args: --from git+https://github.com/The1Studio/unity-mcp.git@beta#subdirectory=Server mcp-for-unity
claude mcp list | grep -i unity  # expect: ✓ Connected
```

If `claude mcp get` shows ANY of the following, the install is wrong — remove and re-add:

- `mcpforunityserver` anywhere in args → upstream PyPI package, banned.
- `--offline` flag → the Editor's "Configure All Detected Clients" button wrote this; permanent connect failure if the package isn't cached.
- `Scope: Local config` instead of `User config` → the Editor's Configure button writes local; user scope is required.
- Branch other than `beta` after `@` (e.g., `@master`) → the submodule pins `beta`.

### ⛔ Forbidden installation paths

| Path | Why banned |
|---|---|
| MCP For Unity Editor panel → **"Configure All Detected Clients"** button (Claude Code client) | Writes `uvx --offline --prerelease explicit --from "mcpforunityserver>=0.0.0a0" mcp-for-unity` to local scope. `--offline` + uncached package = unrecoverable connect failure (documented 2026-05-18). |
| MCP For Unity Editor panel → **"Install Skills"** button | Same broken config as above. |
| `uvx --from mcpforunityserver ...` (any version, any flag combination) | Upstream registry package — not validated against the The1Studio fork's tool patches. |
| Any branch of `The1Studio/unity-mcp` other than `beta` | The Unity-side submodule pins `beta`; the Python server must match. |
| Any third-party fork of `unity-mcp` | Only the The1Studio fork carries our tool patches. |

If the Editor panel shows `Configured` with Claude Code but `claude mcp get` shows the broken PyPI command, click the panel's **`Unregister`** button, then re-run the canonical install commands above. NEVER click "Install Skills" or "Configure All Detected Clients" to recover — those re-write the broken config every time.

## 🔍 When MCP doesn't respond — diagnose Unity status WITHOUT MCP

A failed MCP call (timeout, "Unity is reloading", "No Unity Editor instances") is almost never a bridge connectivity problem. **It usually means Unity's main thread is busy** (compiling, importing, baking, domain-reloading, lightmapping, etc.) and the bridge thread is blocked behind it. Asking the user to "Start Session" is the wrong escalation — the bridge IS connected, Unity just isn't yet ready to service requests.

Before asking the user for help, run these CLI probes to see what Unity is actually doing:

| Signal | Command | What it means |
|---|---|---|
| Editor process alive | `pgrep -af "Unity.*<projectname>"` | Editor PID + count of `AssetImportWorker*` children. >2 workers = active import. |
| Lock file present | `ls Temp/UnityLockfile` | File exists → editor is running on the project. Absent → editor closed. |
| Live import activity | `tail -10 Logs/AssetImportWorker0.log` | "Importing X" / "Reloading scripts" = busy. "shutdown with reason: Scaling down because of idle timeout" = idle. |
| Compile recency | `stat Library/ScriptAssemblies/<assembly>.dll` | mtime = last successful compile. If older than your most recent script edit → still compiling. |
| Bee build state | `ls Library/Bee/artifacts/` count | Growing count = active build. Stable count + recent mtime = build settling. |
| Domain reload | `tail Logs/AssetImportWorker0.log \| grep -i "reload"` | "Begin MonoManager ReloadAssembly" = reloading; "End MonoManager" = done. |

**On Linux, `Logs/Editor.log` does NOT exist at this path** — Unity 6 puts the equivalent main-editor log somewhere else (or only writes to stderr). Use `Logs/AssetImportWorker*.log` instead; they tail the same compile/import activity from the worker side.

### Recovery decision tree

1. MCP call fails → run probes above.
2. Editor process exists + workers active → Unity is BUSY. Wait. Use `Monitor` with an `until` loop watching for `Library/ScriptAssemblies/<assembly>.dll` mtime to advance, OR for the AssetImportWorker log to print "shutdown … idle timeout".
3. Editor process exists + no workers + DLLs are recent + lock file present → bridge socket is genuinely dropped. Ask user to click `Window > MCP for Unity > Start Session`.
4. Editor process gone + lock file gone → user closed Unity. Ask them to reopen.
5. Editor process gone + lock file present → Unity crashed. Ask user to relaunch.

**Never** ask the user to click "Start Session" before completing step 1. False escalation breaks user trust and wastes their time. Prove the bridge is dead by elimination, not by assumption.

## Core Tool Categories

| Category | Key Tools |
|----------|-----------|
| Scene | `manage_scene`, `find_gameobjects` |
| Objects | `manage_gameobject`, `manage_components` |
| Scripts | `create_script`, `script_apply_edits`, `manage_script`, `refresh_unity` |
| Assets | `manage_asset`, `manage_prefabs`, `manage_material`, `manage_texture` |
| Editor | `manage_editor`, `execute_menu_item`, `read_console` |
| Testing | `run_tests`, `get_test_job` |
| Batch | `batch_execute` |
| Camera | `manage_camera`, `manage_cinemachine` |
| Graphics | `manage_graphics`, `manage_render_pipeline`, `manage_shader` |
| Packages | `query_packages`, `manage_packages` |
| ProBuilder | `manage_probuilder` |
| UI | `manage_ui`, `manage_ui_toolkit` |
| DOTS | `manage_dots`, `manage_dots_graphics`, `manage_dots_physics`, `manage_dots_subscene` |
| Physics | `manage_physics`, `manage_physics2d` |
| Navigation | `manage_navigation` |
| Media | `manage_animation`, `manage_audio`, `manage_video`, `manage_vfx`, `manage_timeline` |
| World | `manage_terrain`, `manage_tilemap`, `manage_splines`, `manage_lighting`, `manage_mesh` |
| Systems | `manage_addressables`, `manage_build`, `manage_input_system`, `manage_localization`, `manage_netcode` |
| AI | `manage_behavior`, `manage_asset_hunter` |
| Performance | `manage_profiler`, `rendering_stats`, `validation_snapshot` |
| Code | `manage_scriptable_object`, `find_in_file` |

→ See reference files below for full parameter schemas and examples.

## Common Workflows

→ See `references/workflow-script-lifecycle.md`, `references/workflow-scene-objects.md`, `references/workflow-testing.md`, `references/workflow-assets-prefabs.md`, `references/workflow-batch-operations.md`, `references/workflow-camera-probuilder.md`, `references/workflow-ui-creation.md`, `references/workflow-ui-advanced.md` for extended patterns.

**Quick patterns:**
```python
# New script → attach:
create_script(path="Assets/Scripts/Foo.cs", contents="...")
refresh_unity(mode="force", scope="scripts", compile="request", wait_for_ready=True)
manage_gameobject(action="modify", target="Player", components_to_add=["Foo"])

# Run tests (async):
result = run_tests(mode="EditMode")
get_test_job(job_id=result["job_id"], wait_timeout=60, include_failed_tests=True)
```

## Parameter Type Conventions

- Vectors: `position=[1,2,3]` or `"[1,2,3]"` (both accepted)
- Colors: `[255,0,0,255]` (0–255) or `[1.0,0,0,1.0]` (normalized, auto-converted)
- Paths: `"Assets/Scripts/Foo.cs"` (Assets-relative) or `"mcpforunity://path/..."` (URI)

→ See `references/error-recovery-guide.md` for error recovery table, auto-start setup, cache gotchas, and the 6-step asset refresh hierarchy.

## Reference Files
| File | Contents |
|------|----------|
| `references/tools-scene-objects.md` | manage_scene, find_gameobjects, manage_gameobject, manage_components |
| `references/tools-scripts-assets.md` | create_script, script_apply_edits, manage_asset, manage_prefabs, materials |
| `references/tools-editor-testing.md` | manage_editor, execute_menu_item, read_console, run_tests, find_in_file |
| `references/tools-camera-graphics.md` | manage_camera (all tiers), manage_graphics |
| `references/tools-batch-packages.md` | batch_execute, set_active_instance, query_packages, manage_packages, manage_ui |
| `references/tools-probuilder.md` | manage_probuilder (all actions, known bugs) |
| `references/workflow-script-lifecycle.md` | Create, edit, attach, validate C# scripts |
| `references/workflow-scene-objects.md` | Fresh builds, grids, clone/arrange, physics triggers |
| `references/workflow-testing.md` | Run tests, TDD, diagnose errors, domain reload recovery |
| `references/workflow-assets-prefabs.md` | Materials, textures, folder structure, prefab workflows |
| `references/workflow-camera-probuilder.md` | Camera setup, Cinemachine, ProBuilder scene building |
| `references/workflow-batch-operations.md` | Mass operations, multi-instance, input systems, pagination |
| `references/workflow-ui-creation.md` | UI Toolkit, uGUI Canvas, RectTransform, EventSystem |
| `references/workflow-ui-advanced.md` | Slider, Toggle, Input Field, Layout Group, TMP alignment |
| `references/tools-dots-physics-nav.md` | manage_dots, manage_dots_graphics/physics/subscene, manage_physics/2d, manage_navigation, manage_mesh |
| `references/tools-media-world.md` | manage_animation, manage_audio, manage_video, manage_vfx, manage_timeline, manage_terrain, manage_tilemap, manage_splines, manage_lighting |
| `references/tools-systems-code.md` | manage_addressables, manage_build, manage_input_system, manage_localization, manage_netcode, manage_script, manage_scriptable_object, manage_shader |
| `references/tools-perf-ai-misc.md` | manage_profiler, rendering_stats, manage_cinemachine, manage_render_pipeline, manage_behavior, manage_asset_hunter, validation_snapshot, manage_ui_toolkit |
| `references/error-recovery-guide.md` | Error diagnosis table, auto-start setup, cache gotchas, asset refresh hierarchy |
| `references/upm-gotchas.md` | UPM diagnostic recipes: duplicate-scope registry failure, embed-override pattern, submodule GUID conflict, `refresh_unity` timeout vs bridge disconnect |

## Gotchas

- **Editor MCP server runs in the same process as the editor** — a tool that hangs hangs the editor; never call long-running operations synchronously.
- **Scene mutations via MCP must be wrapped in `Undo.RecordObject` for Ctrl+Z support** — MCP edits without Undo are silently lost on Ctrl+Z.
- **MCP tool result size cap (`maxResultSizeChars`) is per-tool** — unbounded scene exports blow context window.
- **Tool schema can be newer than the active Unity package** — if a tool action from the client schema returns `Unknown action`, fall back to the matching resource or supported action list from the error instead of retrying the same action.
- **UPM "Registry configuration is invalid" / mass package-missing / GUID conflicts / `refresh_unity` timeout** → all four have surgical fixes documented in `references/upm-gotchas.md`. Always grep the Editor log for `"defined by more than one registry"` and `pgrep AssetImportWorker` BEFORE concluding "the bridge is broken" or "every package is missing."
- **Linux/Wayland focus-steal during MCP tool calls is Unity Editor behavior, NOT MCP** — `AssetDatabase.Refresh()`, `CompilationPipeline.RequestScriptCompilation()`, and Test Runner activation all cause Unity to grab focus from whatever window the user is in, on every script edit / `refresh_unity` / `run_tests` call. The MCP package itself never calls `EditorWindow.Focus()` (verified via grep: only one read-only `focusedWindow` reference). **Fix is window-manager-level, not MCP-level.** For KDE Plasma 6 + KWin Wayland: write a window rule to `~/.config/kwinrulesrc` matching `wmclass=Unity` (the Editor's WM_CLASS is literally `Unity`, **not** `UnityEditor` — verify with `kdotool getwindowclassname <id>` before writing the rule), `wmclassmatch=1` (Exact), `fsplevel=4` (Extreme prevention), `fsplevelrule=2` (Force). Then `qdbus6 org.kde.KWin /KWin reconfigure`. Verify with the test job result's `editor_is_focused: false` field after a `run_tests` call. For i3/Sway: `for_window [class="Unity"] focus_on_window_activation none`. For GNOME: `gsettings set org.gnome.desktop.wm.preferences focus-mode 'click'` (partial). Working KDE rule + verified `editor_is_focused: true → false` flip captured in a 2026-05-06 session.

## Reporting MCP Gaps — Emit `[t1k:mcp-gap]` Markers

When the Unity MCP returns a hard "not supported" / "Unknown action" / missing-parameter error, or you discover a feature the MCP cannot perform, emit a marker in your reply text. The Stop-hook collector queues it; the next prompt fires a background `/t1k:issue` sub-agent against `The1Studio/unity-mcp` (the fork repo).

**Marker syntax (all four attributes required):**

```
[t1k:mcp-gap kit="unity" tool="<tool-name>" gap="<one-line summary>" evidence="<verbatim error or repro>"]
```

**Examples:**

```
[t1k:mcp-gap kit="unity" tool="manage_dots" gap="action='set_chunk_capacity' returns Unknown action" evidence="manage_dots(action='set_chunk_capacity', archetype='Player') → {error: 'Unknown action: set_chunk_capacity'}"]

[t1k:mcp-gap kit="unity" tool="manage_terrain" gap="paint_layer rejects normalized splat weights >1.0 silently" evidence="manage_terrain(action='paint_layer', weight=1.5) returns ok but no pixels written"]
```

**When NOT to emit:**

- Transient errors (compilation pending, domain reload) — retry instead.
- Misuse on your part (wrong parameter type, missing required arg) — fix the call.
- Already-known gaps documented in `references/error-recovery-guide.md` — don't re-file.
- Anything that's a fork-feature request requiring upstream coordination — escalate to the user instead.

The marker is sanitized (paths/secrets stripped), fingerprinted, and 7-day deduped. Rate-limited to 5 markers per session shared with `[t1k:lesson]` and `[t1k:skill-bug]`.

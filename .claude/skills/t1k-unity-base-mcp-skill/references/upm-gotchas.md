---

origin: theonekit-unity
repository: The1Studio/theonekit-unity
module: base
protected: false
---
# Unity Package Manager (UPM) Gotchas

Concrete diagnostic recipes for UPM failures that look catastrophic ("nothing compiles, every package is missing") but have surgical fixes. Each entry is keyed by **symptom** so the next session recognizes it instantly.

---

## 1. "Registry configuration is invalid: No packages loaded" — duplicate scope across registries

**Symptom**
- Every UPM package shows "cannot be found" in the Package Manager UI.
- `CS0234` namespace-not-found compile errors across the entire project (every `using` of a UPM-shipped namespace fails).
- Unity console: `Failed to resolve packages: Registry configuration is invalid:` (message truncated in console).
- Even packages from unrelated registries fail to resolve.

**Root cause**
The same scope (e.g. `com.coplaydev.unity-mcp`) is listed in **two scoped registries** in `Packages/manifest.json`. Unity rejects the **entire** `scopedRegistries` block — so every UPM package that depends on any scoped registry fails, even ones from a third unrelated registry.

**Diagnose (Linux)**
```bash
grep -B1 -A3 "defined by more than one registry" ~/.config/unity3d/Editor.log
```
Unity logs the exact duplicate scope + the two registry names there. On macOS look in `~/Library/Logs/Unity/Editor.log`; on Windows `%LOCALAPPDATA%\Unity\Editor\Editor.log`.

**Fix**
Keep each scope in exactly one `scopedRegistries` entry. Pick the registry where the package actually lives. If the package is resolved by `file:` reference, **no scope entry is needed at all** — remove it.

**Anti-pattern**
Unity Package Manager UI can silently **auto-restore** a duplicate scope when you "Add package by name" against a registry that already covers it elsewhere. After fixing `manifest.json`, avoid re-adding via UI — edit the file directly and let Unity re-resolve.

**Bug trail**
DOTS-AI 2026-05-15 — two hours of debugging because Unity also auto-restored the duplicate scope through Package Manager UI interactions.

---

## 2. Embed-override pattern — patching upstream UPM API drift

**Use case**
An upstream UPM package on `master` uses an API that the **published** version doesn't ship yet. Example: `gdk.3rd` master calls `RetryableTask.RunAsync<TState>()` but the registry-published `com.theone.extensions@1.1.33` only ships the 1-argument overload. Project won't compile against the pinned version.

**Pattern (preferred)**
```bash
cp -r Library/PackageCache/<pkg>@<hash>/ Packages/<pkg>/
```
Then patch the file in `Packages/<pkg>/` in place. Unity **prefers embedded packages** over registry resolutions, even if `manifest.json` still pins a registry version.

**Why not switch `manifest.json` to `file:` reference?**
Keeps a **single-line revert path** once upstream fixes ship: just `rm -rf Packages/<pkg>/` and Unity falls back to the cached registry version. A `file:` reference makes the override permanent and requires a manifest edit to undo.

**Document the patch**
Add a comment at the top of the patched file with a **deletion-trigger** so future maintainers know when the embed can go:
```csharp
// EMBED OVERRIDE — patches RunAsync<TState> overload missing in registry 1.1.33.
// DELETE THIS EMBED once com.theone.extensions ships >= 1.1.34 with the 2-arg overload.
// Tracking: <issue-link>
```

---

## 3. GUID conflict — UPM package shipped INSIDE a submodule

**Symptom**
```
GUID [...] for asset '<path>' conflicts with: Assigning a new guid.
```
Hundreds of these errors, one per file under the affected package.

**Root cause**
The same UPM package exists in **two locations** simultaneously:
1. `Packages/<pkg>/` (top-level, expected location)
2. Inside a submodule's own `Packages/` folder, e.g., `Assets/UITemplate/Packages/<pkg>/`

Both copies ship identical `.meta` GUIDs. Unity sees the duplication and randomizes one set on every refresh.

**Fix**
Delete the copy in the **local submodule working tree only** — e.g.:
```bash
rm -rf "Assets/UITemplate/Packages/<pkg>"
```
**Do NOT push the deletion to the shared submodule repo.** Other consumers may legitimately need that package bundled inside the submodule (different Unity project layouts). Treat the deletion as a **local-only modification** — leave the submodule's `git status` showing the deletion but never commit it upstream.

**Long-term fix**
File an issue against the submodule asking the maintainer to externalize the bundled UPM package into a separate scoped registry entry — the in-submodule bundling is the root anti-pattern.

---

## 4. `refresh_unity` MCP timeout — NOT a bridge disconnect

**Symptom**
```
refresh_unity → Command processing timed out after 30000 ms
```

**The wrong response (anti-pattern)**
Asking the user to click "Start Session" in the MCP for Unity window. The bridge is almost always fine — Unity's **main thread is busy** processing imports/compiles, so the bridge thread (which dispatches via the main thread) can't return inside 30s.

**Diagnose first**
```bash
pgrep -af 'AssetImportWorker.*<project>' | wc -l
```
- **>2 workers**: Unity is mid-import. Bridge is fine. **Wait, don't reconnect.**
- **0 workers + recent DLL mtimes + lockfile present**: bridge socket genuinely dead → THEN ask user.
- **0 workers + no editor process**: user closed Unity → ask them to reopen.

**Correct wait pattern**
```bash
until [ $(pgrep -af 'AssetImportWorker.*<project>' | wc -l) -le 1 ]; do sleep 8; done
```

**Linux note**
`Logs/Editor.log` does **not** exist on Linux Unity 6. Use `Logs/AssetImportWorker*.log` (relative to the project root) for compile/import status. The worker log lines `"Importing X"` / `"ReloadAssembly"` mean still-busy; `"shutdown … idle timeout"` means worker has gone idle.

**Related**
See `unity-forbidden-operations.md` (project-level rule) — the same diagnosis tree applies before escalating any MCP timeout to "the bridge is broken."

---

## Cross-references

- `error-recovery-guide.md` — broader MCP error diagnosis table
- Project rule `unity-forbidden-operations.md` (DOTS-AI 2026-05-09) — Reimport All ban + MCP timeout diagnosis tree

## History

Captured 2026-05-15 from a DOTS-AI debugging session where gotchas #1 + #3 together took ~2 hours to diagnose. Encoding here so the next session recognizes the symptom patterns instantly and applies the surgical fix.

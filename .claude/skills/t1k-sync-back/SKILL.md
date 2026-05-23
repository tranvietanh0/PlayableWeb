---
name: t1k:sync-back
description: "Push $HOME/.claude/ skill/agent/rule edits back to their origin kit repos as PRs. Use after fixing a skill locally, updating a gotcha, or improving agent definitions."
keywords: [sync, propagate, upstream, push, contribute, gotcha, pr]
argument-hint: "[<skill-name>|<file-path>] [--dry-run|--force|--already-pushed=pr=N]"
effort: high
context: fork
version: 1.115.3
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-maintainer
protected: true
---

# TheOneKit Sync-Back — Push Changes to Kit Repos

Push `$HOME/.claude/` changes (skills, agents, rules) back to their origin kit repos as PRs.
Uses GitHub MCP tools — no local clone needed.

## Usage
```
/t1k:sync-back                            # NO ARGS = sync EVERYTHING (all unsynced files under both scan roots)
/t1k:sync-back <skill-name>               # Scope to one skill, e.g. /t1k:sync-back t1k-unity-docs
/t1k:sync-back <file-path>                # Scope to one file (relative to a scan root)
/t1k:sync-back <target> --dry-run         # Plan + diff only, no PR
/t1k:sync-back --force                    # Skip confirmation. Diff is ALWAYS shown.
/t1k:sync-back <target> --already-pushed=pr=N
                                          # Branch+PR already exist (manual or prior sync);
                                          # skip clone/push/PR-create; verify + record telemetry only.
```

## No-args mode = sync everything (MANDATORY default)

When invoked with no positional arg and no flags:

1. **Always run the full scan.** Walk `$HOME/.claude/` AND `<cwd>/.claude/` per `references/routing-and-paths.md` Step 0. Do NOT short-circuit on an empty lesson queue — the queue is one input among many, never the only one.
2. **Sync every candidate found.** Group by origin kit/repo per `references/routing-and-paths.md` Step 3 and open one PR per repo, multi-skill if needed.
3. **Never ask "what task did you mean?"** A no-args invocation is an explicit instruction to sync the entire pending set. Treat it the same way `git status && git add -A && git commit` treats no args — process everything.
4. **If the full scan finds zero candidates,** exit cleanly with:
   ```
   No pending changes to sync. Scanned: $HOME/.claude/ and <cwd>/.claude/. Lesson queue: empty. Working tree: clean vs origin.
   ```
   This is success, not a prompt for input.
5. **Anti-pattern:** the sub-agent fork seeing `/t1k:sync-back` with no args and replying "I'll wait for your actual task" — this happened in the May 2026 sessions. The skill MUST proceed with the full scan; clarification questions are forbidden in no-args mode.

## Argument parsing (when an arg IS given)

The first non-flag token is the **target**. Resolution order:

1. **Skill name** — if `$HOME/.claude/skills/<token>/` OR `<cwd>/.claude/skills/<token>/` exists, sync everything under that directory only.
2. **File path** — if the token resolves to a file under a scan root (with or without the `$HOME/.claude/` prefix), sync just that file.
3. **No match** → HARD-FAIL: `"Target '<token>' is neither a skill name nor a file under $HOME/.claude/ or $(pwd)/.claude/. Did you mean: <5 nearest skill names>?"` Do NOT silently fall back to full-tree discovery — that mis-reports scope and surprises the user.

Tokens starting with `-` are flags, never targets.

**Sub-agent context loss:** sync-back invoked from a sub-agent fork loses the parent's conversation context. The skill MUST work from arg + filesystem state alone — never assume conversation memory. No-args = scan everything; explicit-target = scope to that target. Both modes are self-contained.

## Scope — Consumer Projects Only (MANDATORY)

Do NOT invoke when CWD is a kit source repo (`theonekit-core`, `theonekit-unity`, `theonekit-cli`, `theonekit-designer`, `theonekit-cocos`, `theonekit-rn`, `theonekit-web`, `theonekit-nakama`, `theonekit-release-action`, `t1k-telemetry-worker`). Those repos ARE the origin — commit directly. See `references/consumer-guard.md`.

## Invocation Mode (MANDATORY — Background Sub-Agent)

This skill MUST run as a background sub-agent via the `Task` tool, NEVER inline.
**Exception:** explicit user request ("sync this now") → run inline so the diff is visible.

See `references/sub-agent-invocation.md` for the required Task call template, required fields (`kitVersion`, `moduleVersion`, `cliVersion`, `platform`, `rationale`), and the auto-lesson writeback protocol (`submitted: true`, `prUrl`, `fingerprint`).

### Transport: GitHub MCP first, gh CLI fallback (sandbox-asymmetry-safe)

Parent context having access to GitHub MCP or `gh` does NOT guarantee the spawned sub-agent has them — sandbox/permission scopes are evaluated per Task invocation. Probe BOTH at sub-agent start:

1. **Preferred — GitHub MCP**: if `mcp__github__*` tools are listed in the sub-agent's tool roster, use them (see `references/open-pr.md` main flow).
2. **Fallback — `gh` CLI** (when GitHub MCP is absent): `gh auth status` must return 0 AND the sub-agent's Bash permissions must allow `gh api`, `gh pr create`, and either `gh repo clone` or raw `git` against `https://github.com/`. If those pass, the sub-agent MAY proceed using gh — fetch remote content with `gh api repos/{owner}/{repo}/contents/{path}`, edit locally, push via `git push` to a working branch, then `gh pr create`. The PR body, staleness check, and writeback contract are UNCHANGED — only the transport differs.
3. **Neither available** (MCP missing AND gh CLI blocked in child sandbox even though parent has it): DO NOT silently fail. Refuse the sync, report `submitted: false` with reason `transport-unavailable-in-child-sandbox`, and ask the parent to either (a) re-run inline (parent context has the missing tools), or (b) install GitHub MCP via `claude mcp add github` and retry.

This asymmetry is a real failure mode — captured 2026-05-11. Detecting it explicitly avoids burning the circuit-breaker `failures` counter on entries that would succeed if the parent ran them inline.

## Decision tree — which reference do I load?

Load only the reference you need (each is self-contained):

| Intent | Load |
|--------|------|
| Check if CWD is a consumer project (first step, always) | `references/consumer-guard.md` |
| Sub-agent invocation template + auto-lesson writeback contract | `references/sub-agent-invocation.md` |
| Pre-flight checks (MCP, repo access, staleness detection) | `references/preflight-checks.md` |
| **Mandatory pre-triage review BEFORE opening any PR** | `references/pre-triage-review.md` |
| Resolve file origin + compute target path in kit repo | `references/routing-and-paths.md` |
| Open the PR (branch → push → create, fork flow, PR body template) | `references/open-pr.md` |
| Writeback `submitted: true` to the lesson queue | `references/queue-writeback.md` |
| Error table, cross-platform notes, what gets synced / excluded | `references/error-handling.md` |

## Pre-Triage Review — MANDATORY

Every sync-back PR MUST contain a `## Pre-Triage Review` block in the body — risk classification, gate pre-check results, generic-rationale verification, adversarial self-review, recommended triage disposition. This shifts review cost from triage (where it's repeated per run) to filing (where it happens once). Triage's `t1k-code-reviewer` just verifies the block.

Procedure + body template + failure modes (refuse-to-PR cases): `references/pre-triage-review.md`. The block sits AFTER `## Changed files` in `references/open-pr.md`'s PR body template.

## Operational notes

- **Scan BOTH user-scope and project-scope.** Walk `$HOME/.claude/` AND `<cwd>/.claude/` when collecting candidate files. Project-scope modules/skills (e.g., a wiki repo shipping its own module) are invisible if you only scan user-scope. See `references/routing-and-paths.md` Step 0 for the rules. Originating incident: #168.
- **Pre-flight: requires t1k CLI v4.17.0+.** The `require-current-cli.cjs` PreToolUse hook will block stale-CLI invocations of `t1k sync-back` (and other state-mutating commands) when the cached `latest` version is newer than the local binary. Run `t1k self-update` first if the gate fires; override (NOT recommended) is `T1K_REQUIRE_CURRENT_CLI=0`.
- Run pre-flight checks BEFORE any file write — verify GitHub MCP is connected.
- Staleness check is MANDATORY. Never push a stale branch silently.
- Module-registry-sync: if the edit touches `module.json`, the sub-agent must also regenerate `t1k-modules.json` in the kit repo (gate #validate-modules-registry-sync).
- **Skill-rename + activation-fragment sync (2026-05-11)** — when a sync-back diff includes a skill directory rename (e.g., `t1k-rn-rn-base-old` → `t1k-rn-rn-base-new`), the sub-agent must ALSO update every `t1k-activation-*.json` fragment whose `sessionBaseline[]` or `mappings[].skills[]` references the old slug. Bare-slug refs (`old`) and full-prefixed refs (`t1k-rn-rn-base-old`) both need to swap. The release-action prefixer's `buildSelfHealMap()` will catch the rename on the next CI run, but shipping the activation update in the same PR keeps the SSOT consistent and avoids the per-PR drift safety-net gate (`validate-activation-skill-resolution.cjs`) firing on subsequent unrelated PRs against the kit. If unsure which fragments reference the renamed skill, grep: `grep -rE '"(old-slug|t1k-...-old-slug)"' $HOME/.claude/`.
- **Marker-namespace sync (2026-05-15)** — if the changeset adds any `[t1k:<name>` emission in a `.cjs`/`.js`/`.ts` file, the sub-agent MUST run `node $HOME/.claude/scripts/sync-marker-namespaces.cjs --root <kit-root>` in the local kit clone before pushing the branch. The script auto-appends stub rows for new prefixes to `docs/marker-namespaces.md`. After it runs, fill in the Purpose/Emitter/Consumer columns in each stub row and include the `docs/marker-namespaces.md` change in the same commit. This prevents the `validate-marker-namespaces` CI gate from blocking the PR (PRs #206 and #211 both required manual hot-fixes for this). Skip this step only when the kit has no `docs/marker-namespaces.md` (non-core kits that use core's registry).
- PR is created; NOT automerged. End every invocation by reporting the PR URL and noting "review + merge in the kit repo."
- **Security:** never sync `.env`, `settings.local.json`, memory files, or files with secrets. Sanitize absolute paths before writing.
- **Skill-touching syncs MUST consult `t1k-skill-creator`.** If any path in the diff matches `$HOME/.claude/skills/*/SKILL.md` or `$HOME/.claude/skills/*/references/*.md`, the sub-agent invokes `t1k-skill-creator` to validate Skillmark structure (frontmatter shape, line-count cap from gate 2, description cap from gate 3, decision-tree pattern) BEFORE opening the PR. Validation failures block the PR; warnings surface in the PR body so the maintainer reviewer sees them.
- **Naming-prefix gate on creates AND renames.** If the diff CREATES or RENAMES a skill directory or agent file, the sub-agent MUST verify the new name conforms to the universal `t1k-` prefix rule (`rules/naming-convention.md`): core = `t1k-{slug}`, kit-wide = `t1k-{kit}-{slug}`, module-scoped = `t1k-{kit}-{module}-{slug}`. Frontmatter `name:` MUST match the directory/file basename. Non-conforming names will fail `validate-skill-prefix.cjs` / `validate-agent-prefix.cjs` at PR time — catch them here and reject the sync-back with a clear error message instead of opening a PR that will block on CI. Agent rename gap (2026-05-08): `auto-prefix-agents.cjs` does NOT rewrite per-module `module.json` `agents`/`routingOverlay` fields, so the sync-back sub-agent must hand-update both manifests when renaming agents.
- **CI-prefix lookup BEFORE computing target path (consumer→kit name asymmetry).** Skill names in the consumer-side install are CI-prefixed at release time by `auto-prefix-skills.cjs` — e.g., a kit-source path of `$HOME/.claude/modules/cocos-base/skills/playable-async-utilities/SKILL.md` ships to consumers as `t1k-cocos-cocos-base-playable-async-utilities`. When sync-back resolves a target path in a kit source repo, it MUST NOT reuse the prefixed consumer-side directory name verbatim. Instead, look up the unprefixed source slug via either (a) the skill's frontmatter `origin` + `module` fields plus the kit's `.t1k-manifest.json` (kit-flat) / `modules/{module}/.t1k-manifest.json` (modular), or (b) the GitHub Tree API: `gh api repos/{owner}/{repo}/git/trees/main?recursive=1 --jq '.tree[].path | select(endswith("/SKILL.md"))'` then match by basename or by reading frontmatter `name:`. `references/routing-and-paths.md` Step 2 examples currently show only the kit-flat unprefixed case — assuming the consumer name maps 1:1 to the kit path will mis-target every modular kit (theonekit-cocos, theonekit-unity, theonekit-designer). Always probe before writing.

## Contribution Scoring

After successful PR creation, invoke `t1k:contribution-score` with `type=sync-back-pr`, the resolved `ref_url` (the PR URL returned by `gh pr create`), the PR title + description, and the target kit/repo. Fire-and-forget — never block on the result.

See `$HOME/.claude/skills/t1k-contribution-score/SKILL.md` for the full invocation contract (rubric, endpoint resolution, POST contract). Do NOT inline rubric or POST logic here — the SSOT lives in that skill.

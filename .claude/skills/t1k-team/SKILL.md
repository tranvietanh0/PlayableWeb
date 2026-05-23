---
name: t1k:team
description: "Spawn parallel agent teams for large features. Use for multi-agent research, implementation, review, or debugging across independent workstreams requiring 3+ agents."
keywords: [parallel, multi-agent, orchestrate, teammates, concurrent, delegate]
argument-hint: "<template> <context> [--devs|--researchers|--reviewers|--debuggers N] [--delegate]"
effort: high
context: fork
version: 1.94.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-extended
protected: true
---

# TheOneKit Team — Registry-Aware Agent Teams

Orchestrate parallel Claude Code Agent Teams with T1K infrastructure: registry-routed agents, module-scoped skill injection, manifest-derived file ownership, mandatory worktree isolation.

**Requires:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env.
**Requires:** CLI terminal — Agent Teams tools are disabled in VSCode extension.
**Model:** All teammates run Opus 4.6 (Agent Teams constraint).

## Agent Routing

Follow protocol: `skills/t1k-cook/references/routing-protocol.md`
Templates resolve roles dynamically: `t1k-researcher`, `implementer`, `reviewer`, `t1k-debugger`, `t1k-tester`, `t1k-planner`

## Templates

| Template | Purpose | Risk | Reference |
|----------|---------|------|-----------|
| `research` | N researchers, module-scoped angles | Low (read-only) | `references/research-template.md` |
| `review` | N reviewers, registry-routed, module boundary checks | Low (read-only) | `references/review-template.md` |
| `cook` | N implementers, worktree-isolated, manifest ownership | Medium (writes code) | `references/cook-template.md` |
| `debug` | N debuggers, adversarial hypotheses, worktree-isolated | Medium (may add debug code) | `references/debug-template.md` |
| `triage` | Parallel issue/PR processing across kit repos | Low (read + GitHub API) | `references/triage-template.md` |

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--researchers N` | 3 | Number of researchers |
| `--reviewers N` | 3 | Number of reviewers |
| `--devs N` | auto | Number of devs (auto = one per module) |
| `--debuggers N` | 3 | Number of debuggers |
| `--delegate` | off | Lead only coordinates, never touches code |
| `--no-plan-approval` | off | Skip plan approval gate (cook template) |

## Pre-flight Protocol (MANDATORY)

0. **Load deferred tool schemas FIRST.** In long-context sessions (1M Opus), both `Agent` and `TeamCreate` are commonly auto-deferred — they appear in the `<system-reminder>` deferred-tools listing but their JSON schemas are NOT loaded into the active scope. Calling them directly fails with `InputValidationError`. **Always run this ToolSearch before any availability check**, even if the tools appear to already be in scope:

   ```
   ToolSearch(query="select:Agent,TeamCreate", max_results=2)
   ```

   This loads both schemas in one call if either is deferred. ToolSearch never errors when a tool is genuinely absent — it just returns 0 matches for that name. After this call, retry the availability check in Step 1.

   **Why this exists:** Issue #208 — without Step 0, the prior pre-flight saw `Agent`/`TeamCreate` "not in active scope" and falsely diagnosed "forked sub-context" even when `/t1k:team` was invoked from the main session. The tools were merely deferred and one ToolSearch away from being available. The fork-context diagnostic in Step 1 only fires now if BOTH names are absent from the deferred-tools listing AND from active scope after this load attempt.

1. **Verify `Agent` is now in scope.** After Step 0, confirm `Agent` is callable. Two distinct failure modes — handle each correctly:

   **(a) Genuine fork-context** — `Agent` is absent from BOTH the deferred-tools listing AND active scope. This means the skill was invoked from a forked sub-context (via the `Skill` tool from a sub-agent, or another skill marked `context: fork`). STOP IMMEDIATELY with:

   > **t1k-team cannot spawn teammates from this context.** The `Agent` tool is not in scope and not in the deferred-tools listing, which means this skill was invoked from a forked sub-context. Re-invoke `/t1k:team` from the **main session** instead. Serial-as-lead fallback is forbidden because it silently breaks the parallelism contract and the worktree-isolation / manifest-ownership guarantees.

   **(b) Deferred but loadable** — `Agent` appeared in the deferred-tools listing and Step 0's ToolSearch loaded the schema. Proceed to Step 2. **Do NOT emit the fork-context warning.** This is the bug fix in v1.91.0 — earlier versions conflated cases (a) and (b), producing false "you are in a forked sub-context" warnings from main session.

   Why this matters: when `/t1k:team` is routed by the harness, the skill body itself runs with `context: fork`, but in 1M Opus sessions BOTH the parent main session AND legitimate skill execution show `Agent` as deferred-not-yet-loaded. The deferred-tools listing is the discriminator — if `Agent` is in that listing, the parent context is fine and ToolSearch will resolve it. Only true absence (not in deferred list, not in scope) indicates the unfixable forked-sub-agent case. Real-world miss without this fix: 2026-05-10 wiki-closure session, commit `69f0831` on `The1Studio/AIPoweredGameDevelopmentSystem.wiki`, five `fullstack-developer` teammates were requested and silently executed serially (issue #163). Inverse miss after over-fix: false fork-context warnings from main session (issue #208).

2. **Verify `TeamCreate` is available BEFORE calling it.** After Step 0's bulk load, confirm `TeamCreate` is callable. If it is genuinely absent (NOT in the deferred-tools listing, NOT in active scope after Step 0), **AUTO-ENABLE the env var in settings.json, then STOP IMMEDIATELY and ask the user to restart their session** — do NOT silently fall back to plain `Agent` spawning, do NOT proceed with the template.

   **Auto-enable is MANDATORY — fork context does NOT excuse you.** The skill body runs under `context: fork`, and `Agent`/`TeamCreate` are absent from that fork's tool scope, BUT `Read`/`Write`/`Edit`/`Bash` ARE available in fork scope. You can — and MUST — write settings.json yourself. Do NOT delegate the write to the lead via prose ("lead should enable env var…") — that produces the v1.91.0 regression bug where users see "TeamCreate isn't available" output without any settings.json change. Verified failure mode 2026-05-14 session — issue tracked as [#209+].

   **Auto-enable procedure** (full detail: `references/auto-enable-agent-teams.md`):

   a. **Detect target settings.json.** Apply these rules IN ORDER (first match wins):

      1. If user message contains "global", "user-scope", "everywhere", or "all projects" → user-scope `$HOME/.claude/settings.json`.
      2. **Kit-source-repo auto-promotion** — if `<cwd>/.claude/skills/t1k-team/` exists as a directory (i.e., we are INSIDE a kit source repo that ships this very skill), promote to user-scope `$HOME/.claude/settings.json`. Writing to the kit's own `.claude/settings.json` would ship the env var to ~50 consumers via the release pipeline. Detection command: `test -d "$PWD/.claude/skills/t1k-team" && echo kit-source-repo`.
      3. Otherwise → project-scope `<cwd>/.claude/settings.json`.

   b. **Read existing settings.json** (if any) via `Read` tool. If the file already has `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` set to `"1"`, skip the write and display the "already-enabled" message — the user just needs to restart.

   c. **Merge or create** — if settings.json exists with other content, `Edit` to add/merge the env entry, preserving all other keys. If it doesn't exist, create the parent `$HOME/.claude/` directory if missing and `Write` a minimal `{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }`.

   d. **Display restart instruction** — exact format:

      > **Agent Teams enabled in `<path>`.**
      >
      > Restart your Claude Code session now to load the env var (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). Env vars in settings.json only take effect at session start.
      >
      > **CLI:** exit (Ctrl+D or `/exit`), then relaunch `claude`. **VSCode extension:** Agent Teams remains disabled — switch to CLI terminal.
      >
      > After restart, re-run `/t1k:team <template> <context>` and the skill will detect `TeamCreate` is available and proceed.

   e. **STOP IMMEDIATELY** — do NOT attempt to spawn the team in this session. Env vars do not hot-reload; any attempt to call `TeamCreate` before restart will fail.

   Why this matters: `TeamCreate`/`TeamDelete`/the team-mode `SendMessage` variants are only registered as tools when the env var is set at session start. When unset they are absent from the tool list entirely — there is no error to catch. Without this explicit availability check, the AI satisfies "spawn parallel teammates" with whatever tools it has (regular `Agent`), and the user gets degraded "team-shaped output" without worktree isolation, manifest-derived file ownership, or the shared task list. Auto-enabling at first invocation kills the friction of "edit settings.json by hand → restart → retry the command you originally wanted."

   Once verified available (TeamCreate schema loads), call `TeamCreate(team_name: ...)` per the matching template. If `TeamCreate` errors AFTER passing the availability check, surface the error and STOP.
3. **Resolve roles** — follow `skills/t1k-cook/references/routing-protocol.md`
4. **Detect modules** — follow `skills/t1k-modules/references/module-detection-protocol.md`
5. **Derive file ownership** — `references/manifest-ownership-resolution.md`
6. **Build skill injection** — follow `skills/t1k-cook/references/subagent-injection-protocol.md`
7. **Cost warning** — inform user of teammate count and estimated token cost

Every teammate spawn prompt MUST include the T1K Context Block: `references/t1k-context-block.md`

## Decision Discipline (MANDATORY)

When this skill (or any sub-protocol it spawns) needs the user to make a multi-option choice — including yes/no, A-or-B, or any "pick one of these" prompt — you MUST call `AskUserQuestion`. Prose option lists are forbidden, including from skill output that arrives via `<local-command-stdout>`.

**If `AskUserQuestion` appears in the deferred-tools list:** load it FIRST via `ToolSearch(query="select:AskUserQuestion", max_results=1)` before constructing the question. The schema is auto-deferred in 1M-context Opus sessions; the SessionStart hook `decision-tools-preload.cjs` emits a `[t1k:decision-tools]` reminder every session as a backup signal.

**Forbidden prose patterns** in this skill's output AND in any teammate's output:

- "Pick one (reply with the number): 1. … 2. … 3. …"
- "Want me to do A or B?"
- "Should I proceed?"
- Any bulleted/numbered choice list followed by a question mark
- "I cannot use AskUserQuestion right now, so please reply with…" — there is no such fallback; load the schema instead

**When THIS skill body needs a user decision (not just the calling lead):** call `AskUserQuestion` directly from the skill body — do NOT emit a prose option list and rely on the lead to convert it. The lead-side conversion is a fallback for legacy skill output, not the contract. If the schema is deferred, run `ToolSearch(query="select:AskUserQuestion", max_results=1)` first, then call the tool from inside this skill.

**Plan-Fit Assessment Gate (cook template):** before spawning N implementer teammates, the lead MUST present the proposed plan-to-team fit (which modules each dev owns, file-conflict risk, estimated tokens) via `AskUserQuestion` with at least these options: `proceed`, `re-shape teams`, `reduce scope`, `abort`. Skipping this gate produced the 2026-05-08 prefix-migration regret loop where teammates were re-spawned twice mid-flight.

**Why this matters:** prose option lists bypass the structured-answer contract — the user must re-type the choice and the skill cannot reliably parse the reply. Real-world miss (2026-05-08): t1k-team emitted prose `1./2./3.` options in its `<local-command-stdout>`; lead relayed verbatim instead of converting to `AskUserQuestion`. User pushback: "why don't use ask me with question tool?"

Cross-reference: `~/.claude/rules/always-ask-on-unresolved.md` § "Failure mode — skills that emit prose option lists", `~/.claude/rules/ask-before-deciding.md`.

## Execution Protocol

When activated, IMMEDIATELY execute the matching template sequence.
Do NOT ask for confirmation. Execute tool calls in order. Report after each major step.

Details on all operational protocols: `references/team-operations.md`

## When to Use Teams vs Subagents

| Scenario | Subagents | Agent Teams |
|----------|-----------|-------------|
| Focused single task | **Yes** | Overkill |
| Sequential chain | **Yes** | No |
| 3+ independent parallel workstreams | Maybe | **Yes** |
| Competing debug hypotheses | No | **Yes** |
| Cross-module implementation | Maybe | **Yes** |
| Token budget is tight | **Yes** | No |

## Constraints

- Teammates inherit the lead's permission settings at spawn time.
- No recursive spawning: teammates MUST NOT spawn their own Agent Teams.
- **Invoke from the main session only.** When this skill is invoked via the `Skill` tool from a sub-agent (or any other forked sub-context), the `Agent` tool is stripped from scope and teammates cannot be spawned. Pre-flight Step 1 hard-errors in that case (after Step 0 attempts to load deferred schemas) rather than degrading silently to serial-as-lead. See issue #163 for the original fork-detection diagnostic and issue #208 for the deferred-tool false-positive fix shipped in v1.91.0.

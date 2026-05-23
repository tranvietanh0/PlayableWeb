---
name: t1k:cook
description: "Implement features end-to-end: plan, code, test, review via registry agents. Use for 'implement X', 'build Y feature', 'add Z functionality'. Handles full workflow."
keywords: [implement, build, feature, add, create, develop, end-to-end]
argument-hint: "[task|plan-path] [--interactive|--fast|--parallel|--auto|--no-test|--tdd]"
effort: high
context: fork
version: 1.108.0
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-base
protected: true
---

# TheOneKit Cook -- Feature Implementation

End-to-end feature implementation. Routes to the registered implementer agent for the current kit.

**Principles:** YAGNI, KISS, DRY | Token efficiency | Concise reports

## Tool guard — `AskUserQuestion` is deferred

`AskUserQuestion` is a deferred tool: its name appears in the deferred-tools system-reminder but its schema is NOT loaded at session start. Direct invocation fails with `InputValidationError`.

**Operational pre-step (mandatory before drafting any structured multi-option question):**

1. Verify `AskUserQuestion` is in the loaded tool list. If not, run:
   ```
   ToolSearch(query="select:AskUserQuestion", max_results=1)
   ```
2. THEN draft and invoke the tool with batched options.

**Failure mode this guard prevents:** assistant remembers the rule, drafts the question correctly in its head, then because the tool isn't loaded, falls back to "I'll just write the options as prose, and call the tool next time." Drafting prose bullets first is a violation — see `rules/always-ask-on-unresolved.md` "Forbidden prose" table.

## Decision tree — which path do I take?

Pick by intent; keep loading minimal.

| Intent | Path |
|---|---|
| Ship a feature end-to-end with research + tests + review | Default `--interactive` workflow below |
| Plan exists already; execute it | Pass plan path; mode auto-detects to `code` |
| Skip research; you trust the spec | `--fast` (still requires plan step) |
| Multiple unrelated features at once | `--parallel` (sub-agents on disjoint files) |
| Test-driven: tests first, then code | `--tdd` (incompatible with `--parallel` / `--no-test`) |

## Usage
```
/t1k:cook <natural language task OR plan path>
```

**IMPORTANT:** If no flag is provided, the skill uses `interactive` mode by default.

**Optional flags:** `--interactive` (default) | `--fast` (skip research) | `--parallel` (multi-agent) | `--no-test` | `--auto` (auto-approve) | `--tdd` (test-driven: write tests first, implement, verify)

## Agent Routing
Follow protocol: `skills/t1k-cook/references/routing-protocol.md` — role: `implementer`

## Skill Activation
Follow protocol: `skills/t1k-cook/references/activation-protocol.md`

<HARD-GATE>
Do NOT write implementation code until a plan exists and has been reviewed.
Exception: `--fast` mode skips research but still requires a plan step.
User override: If user explicitly says "just code it" or "skip planning", respect their instruction.
</HARD-GATE>

## Smart Intent Detection

| Input Pattern | Detected Mode |
|---------------|---------------|
| Path to `plan.md` or `phase-*.md` | code — execute existing plan |
| Contains "fast", "quick" | fast — skip research |
| Contains "trust me", "auto" | auto — auto-approve all steps |
| Lists 3+ features OR "parallel" | parallel — multi-agent |
| Contains "no test", "skip test" | no-test — skip testing |
| Contains "tdd", "test first", "test-driven" | tdd — write tests before implementation |
| Default | interactive — full workflow |

Full detection logic: `references/intent-detection.md`

## Workflow

```
[Intent Detection] -> [Drift Check] -> [Research?] -> [Review] -> [Plan] -> [Review] -> [Implement] -> [Review] -> [Test?] -> [Review] -> [Finalize]
```

**Drift Check (Step 0.5, MANDATORY):** before any research/plan/code, run a quick `git fetch` + scan of recent merges (default branch, last ~24h) to confirm a teammate hasn't already shipped this fix or partially addressed it. Applies in ANY repo where cook runs — kit source, consumer game project, library, anywhere. Skips silently for non-git or no-remote directories. Procedure + decision tree: `references/workflow-steps.md` § "Step 0.5". Originating incident: 2026-05-14 cook on theonekit-cli #143 caught a 6-hour-old overlapping merge (PR #153) and turned a would-be duplicate into a valuable follow-up.

| Mode | Research | Testing | Review Gates |
|------|----------|---------|--------------|
| interactive | yes | yes | User approval at each step |
| auto | yes | yes | Auto if score>=9.5 |
| fast | no | yes | User approval at each step |
| parallel | optional | yes | User approval at each step |
| no-test | yes | no | User approval at each step |
| code | no | yes | User approval per plan |
| tdd | yes | yes (3.T/3.I/3.V) | User approval at each step |

Full step definitions: `references/workflow-steps.md`
TDD sub-step details: `references/workflow-steps.md` → `## --tdd Flag Behavior`
Review processes: `references/review-cycle.md`

### Guards

- `--tdd + --parallel`: REFUSE with error: "TDD requires strict ordering (tests → implement → verify); parallel execution cannot preserve this. Use `--tdd` alone, or `--parallel` without `--tdd`. For a fast sequential path, consider `--tdd --fast`."
- `--tdd + --no-test`: REFUSE with error: "TDD mode inherently requires the test suite; `--no-test` is contradictory. Remove one of the flags."
- `--tdd + --parallel` is unsupported and will error. Do not attempt to combine them.
- `--auto + --interactive`: existing guard, unchanged.

## Required Subagents (MANDATORY)

Testing, Review, and Finalize phases **MUST** use Task tool to spawn subagents — DO NOT inline these steps.

Full subagent table and injection protocol: `references/subagent-patterns.md`

**Finalize (never skip):** t1k-project-manager → plan sync-back | t1k-docs-manager → update `./docs` | t1k-git-manager → commit offer

- When you discover a non-obvious gotcha while implementing, emit a
  `[t1k:lesson kit="..." skill="..." fragment="..." reason="..."]` marker
  in your final message. The lesson-collector hook queues it for
  follow-up sync-back automatically.

## Blocking Gates (Non-Auto Mode)

Human review required at: Post-Research, Post-Plan, Post-Implementation, Post-Testing (100% pass required).

Always enforced: 100% test pass (unless no-test), code review score>=9.5 for auto-approve.

## When implementation goes wrong — recovery via rollback

If an implementation corrupts `~/.claude/` state (bad merge, mis-applied
prefix, broken hooks), use the H7 rollback command rather than a manual
clean-up:

```
t1k rollback --kit <name> --to-snapshot pre-<previous-version>
```

- Snapshots live at `~/.claude/.t1k-snapshots/<kit>/pre-<version>/`.
  Cap is 5 most-recent per kit; older ones soft-move to
  `~/.claude/.t1k-trash/<kit>/`.
- `--to-snapshot` MUST literally start with `pre-` (e.g. `pre-2.4.1`).
  Bare versions are rejected.
- `--yes` is currently a no-op as of cli@v4.14.0 — does not bypass
  anything. Future-proof only.
- Restore is a non-destructive copy: files added by the bad implementation
  are NOT removed. Run `/t1k:doctor` afterwards to spot stragglers.

**Critical caveat (cli@v4.14.0):** the install/update pipeline does not
yet auto-create snapshots. If `t1k rollback` reports
`snapshot '<kit>/pre-<version>' does not exist`, fall back to
`t1k install --reset` (the sanctioned destructive path; takes its own
`~/.claude-backup-{ISO-ts}/` first). NEVER `rm -rf ~/.claude/` — <!-- gate:allow-rm-claude (rule statement) -->
the `validate-no-raw-rm-claude.cjs` gate forbids it and you'll lose
`.t1k-snapshots/`, `.t1k-trash/`, and any user-customized files.

For per-file/per-step recovery, prefer `git restore` on the project
side; the H7 rollback is for `~/.claude/` state, not project source.
Full reference: `skills/t1k-kit/references/cli-commands.md` →
`t1k rollback`.

## Environment Variables

T1K resolves env vars in priority order — never hardcode values. Details: `references/env-hierarchy.md`

## References

- `references/intent-detection.md` — detection rules and routing logic
- `references/workflow-steps.md` — detailed step definitions for all modes
- `references/review-cycle.md` — interactive and auto review processes
- `references/subagent-patterns.md` — subagent invocation patterns
- `references/env-hierarchy.md` — .env resolution hierarchy
- `references/god-prefab-extraction-risk.md` — plan-phase detection for god-prefab moves to Addressables; required audit during Step 2 when removing prefabs from scenes
- `references/runtime-smoke-gate.md` — Step 3 HARD-GATE: runtime Play Mode smoke required when scene/prefab assets are touched; prevents the The1Studio/theonekit-core#176 NRE-cascade incident class

## Contribution Scoring

If Finalize opens a PR, invoke `t1k:contribution-score` with `type=sync-back-pr` + PR URL/title/body. Fire-and-forget; SSOT gates non-T1K repos. See `.claude/skills/t1k-contribution-score/SKILL.md`.

## Sub-Agent Fork Hygiene

**Sub-agent forking:** see `skills/t1k-architecture/references/fork-hygiene.md`.

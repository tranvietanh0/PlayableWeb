---
name: t1k:resolve-context
description: "Resolve ambiguous references from prior conversation by scanning recent plans / reports / git activity / transcripts. Returns a Fork Context Brief ready to embed when invoking a forked skill."
keywords: [resolve, context, fork, brief, reference, ambiguous, plan, above, previous]
argument-hint: "<ambiguous-reference-text> [--for <skill-or-agent>]"
effort: low
version: 1.108.0
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-base
protected: true
---

# T1K Resolve-Context — Fork Context Brief Builder

Turn ambiguous references (`"plan B"`, `"that report"`, `"the one above"`) into a structured **Fork Context Brief** so forked skills / agents start with full grounding instead of a round-trip "I don't see X."

Read [`rules/fork-context-brief.md`](../../rules/fork-context-brief.md) for the protocol definition; this skill executes Rule 2 (resolution) on the SENDER side.

## Security (MANDATORY — read before workflow)

This skill reads from `~/.claude/projects/{slug}/*.jsonl` (transcripts) and `MEMORY.md` (user memory). Both may contain secrets, PII, or content from prior sessions that the user has forgotten. The Brief this skill produces is pasted verbatim into a fresh subagent prompt — anything in it leaks across the context boundary.

**Hard rules (no exceptions):**

1. **NEVER include raw transcript excerpts, prompt text, or `MEMORY.md` content verbatim in the Brief.** Use them ONLY to identify file paths + ≤120-char role descriptions derived from filenames or first-heading lines.
2. **Before emitting any Brief, scan the proposed text for** `Bearer `, `api_key`, `sk-`, `AKIA`, `-----BEGIN`, `password=`, `token=`, `secret=`. If any match, refuse and ask the user for an explicit path instead.
3. **Validate every `artifacts:` path** resolves under `$CLAUDE_PROJECT_DIR` or `$HOME/.claude/` AND does not match `.env*`, `*.pem`, `*.key`, `credentials.*`, `secrets.*`, `.git/`. Reject paths that fail.
4. **Derive transcript slug from `$CLAUDE_PROJECT_DIR`** (or the hook payload's `transcript_path`), NOT from `pwd` (cwd can drift mid-session, and pwd-based slugs don't match the harness layout when paths contain `.` or spaces).

## When to use

Call BEFORE invoking any `Skill` whose frontmatter declares `context: fork`, any `Agent` tool call, or any `TeamCreate`, **IF** the user's prompt contains references that depend on prior conversation:

| Trigger phrase in user prompt | Run this skill? |
|---|---|
| `above`, `previous`, `that`, `this`, `the one`, `as we discussed` | Yes |
| `plan A/B/C`, `option N`, `round N`, `phase N` (no path) | Yes |
| Pronouns referring to prior artifacts (`it`, `them`, `they`) | Yes |
| Explicit file path or self-contained noun phrase | No — pass through |
| Pure factual question | No |

## Workflow

1. **Identify the ambiguous tokens** in the user's prompt. List them (e.g. `["plan B", "the report"]`).

2. **Run resolution order** (stop early when a candidate is unambiguous):

   ```bash
   # a) recent plans (last 2h, then last 7 ranked)
   find plans/ -type f -name '*.md' -mmin -120 2>/dev/null | head -10
   ls -t plans/ 2>/dev/null | head -7

   # b) recent reports
   ls -t plans/reports/ 2>/dev/null | head -5

   # c) git activity (uncommitted + recent commits)
   git status --short 2>/dev/null
   git log --since="2 hours ago" --name-only --oneline 2>/dev/null | head -30

   # d) current session transcript (tail last ~50 lines)
   #    Prefer the hook's payload.transcript_path when available (canonical).
   #    Fallback: derive slug from $CLAUDE_PROJECT_DIR using the SAME substitution
   #    the harness uses — '/' AND '.' AND ' ' all collapse to '-'.
   PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
   SLUG="$(echo "$PROJECT_ROOT" | sed -E 's|[/. ]|-|g')"
   TRANSCRIPT_DIR="$HOME/.claude/projects/$SLUG"
   [ -d "$TRANSCRIPT_DIR" ] || TRANSCRIPT_DIR="$(ls -td "$HOME/.claude/projects/"*"$(basename "$PROJECT_ROOT" | tr '/. ' '-')"* 2>/dev/null | head -1)"
   if [ -n "$TRANSCRIPT_DIR" ] && [ -d "$TRANSCRIPT_DIR" ]; then
     ls -t "$TRANSCRIPT_DIR"/*.jsonl 2>/dev/null | head -1 | xargs -r tail -n 50 2>/dev/null
   fi

   # e) durable memory + active-plan hints (same SLUG as above)
   [ -n "$TRANSCRIPT_DIR" ] && cat "$TRANSCRIPT_DIR/memory/MEMORY.md" 2>/dev/null
   grep -E '(active plan|current plan)' CLAUDE.md 2>/dev/null
   ```

3. **Construct the Brief.** Use the canonical block from `rules/fork-context-brief.md`:

   ```
   === FORK CONTEXT BRIEF ===
   intent: <one-sentence what the user wants the fork to do>
   artifacts:
     - <absolute path> — <role, e.g. "the 'plan B' user referred to (5 phases, ~6h)">
     - <absolute path> — <role>
   recent_work:
     - <one-line summary of relevant prior turn>
   user_decisions:
     - <decision> = <value>
   open_threads:
     - <unresolved item or "none">
   === END BRIEF ===

   <user's original prompt, rewritten to be self-contained>
   ```

   Required: `intent`, `artifacts`. Skip empty sections — never emit placeholder text.

4. **Return** the Brief block + rewritten prompt as a single fenced output the caller can paste into the next `Skill` / `Agent` / `TeamCreate` invocation.

5. **Partial resolution.** If any reference stayed ambiguous after steps 2a–e, list the surviving ambiguities with the top 1–3 candidates ranked by `mtime DESC` and one-line summaries (first heading of each candidate file). Only THEN ask the user to pick — phrased as "I checked plans/, git log, and transcript; couldn't pin down X. Did you mean (a) …, (b) …, (c) …?"

## Resolutive over interrogative

**Forbidden first move:**

> "I don't see any plan B. Could you tell me which file you meant?"

**Required first move:** run the resolution commands. Asking is the LAST resort, only when steps 2a–e all returned empty or genuinely ambiguous (≥4 candidates with similar mtimes).

## Gotchas

- **First-session transcripts may not exist** — the `$HOME/.claude/projects/...` directory is only created after the first user turn lands. Treat absence as "no transcript signal," not an error.
- **Transcript layout is FLAT** — `~/.claude/projects/{slug}/*.jsonl` (per-session files directly in the slug dir). The older `{slug}/{session-uuid}/transcript.jsonl` layout does NOT exist; do not look for it.
- **Slug derivation** — Claude Code collapses `/`, `.`, AND ` ` (space) to `-` in the slug. For example, `/mnt/Work/1M/8. OneAI/ClaudeAssistant` → `-mnt-Work-1M-8--OneAI-ClaudeAssistant` (note the doubled `-` from `. `). The workflow uses `sed -E 's|[/. ]|-|g'` to match.
- **Use `$CLAUDE_PROJECT_DIR`, not `pwd`** — cwd drifts when the user `cd`s into a subdir mid-session. The harness sets `CLAUDE_PROJECT_DIR` to the canonical project root.
- **Multiple candidates for "plan B"** — when 2–3 plan dirs match, rank by `mtime DESC` and present each with its first `# heading` line (`head -1 plans/<dir>/plan.md`). Pick #2 only when the user said "B" AND there are exactly 2 — otherwise list candidates.
- **macOS BSD `find` quirks** — `-mmin` works on both BSD and GNU; the safety net here is `2>/dev/null`, not a flag substitution.
- **Privacy (REFER TO Security section ABOVE)** — do NOT quote transcript content back to the user; the Brief cites artifact paths + ≤120-char summaries, never raw conversation excerpts. Always run the secret-pattern scan before emitting the Brief.

## Related

- [`rules/fork-context-brief.md`](../../rules/fork-context-brief.md) — the FCB protocol (Rule 1 = sender, Rule 2 = receiver)
- [`rules/orchestration-rules.md`](../../rules/orchestration-rules.md) — Context Isolation Principle this skill navigates around
- [`rules/always-ask-on-unresolved.md`](../../rules/always-ask-on-unresolved.md) — when asking is unavoidable after resolution fails

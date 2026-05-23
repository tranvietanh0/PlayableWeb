---

origin: theonekit-core
repository: The1Studio/theonekit-core
module: null
protected: true
---
# Always Ask on Any Unresolved Item — Strict AskUserQuestion Mandate

This is a strict extension of `~/.claude/rules/ask-before-deciding.md`. When in conflict, this file wins.

## Rule

**You MUST invoke `AskUserQuestion` for ANY of the following — even if the global rule would let you proceed silently:**

1. **Any question you would otherwise phrase to the user in prose** — yes/no, single-option confirmations, "should I…?", "can I…?", "do you want…?", "ready to…?"
2. **Any unresolved item in a plan** before proceeding past it — `TBD` / `TODO` / `??` markers, conflicting requirements between phases.
3. **Any unresolved item in a report** before submitting it as final — listed-but-unanswered questions, ambiguous findings, partial conclusions.
4. **Any ambiguity discovered mid-implementation** that wasn't covered by the prior plan/answer — newly-surfaced edge cases, naming choices for new public APIs, file placement when multiple valid locations exist.
5. **Any default value or policy choice** not explicitly handed to you — multi-resolution policies, fallback behaviors, threshold values, severity levels, retention durations.
6. **Any deletion, overwrite, or destructive action** whose blast radius is non-trivial — even if you have a strong default. Ask first.
7. **Any skill needing a multi-option decision.** Skill bodies MUST call `AskUserQuestion` (or instruct the calling agent to). Prose options bypass the structured-answer contract. If `AskUserQuestion` is deferred, load via `ToolSearch(query="select:AskUserQuestion")` first. No "skill emitted prose" exemption.

## How to apply

When in doubt → invoke `AskUserQuestion`. Asking is cheap; assuming is expensive. The bias is **always toward asking**. "Intent is clear enough" is the sound of a forthcoming wrong assumption.

## Plan / report deliverables

Before writing or finalizing ANY plan file (`plans/**/*.md`, `phase-*.md`) or report (`plans/reports/**`, `plans/research/**`):

1. Scan your draft for unresolved markers: `TBD`, `TODO`, `???`, `open question`, `unresolved`, `pending`, `to be decided`, `unclear`.
2. For EACH unresolved item, batch into a single `AskUserQuestion` call (max 4 per call — split if more).
3. Only mark the deliverable "ready" / commit it after all items resolved.

Reports MAY include a final "Unresolved questions" section ONLY when the user explicitly accepted that some items are deferred.

## Narrow exceptions (when NOT to ask)

| Scenario | Why no question |
|---|---|
| User just gave a direct command in the same turn | They told you what to do |
| Reporting results of an action already taken | Reporting ≠ deciding |
| Pure factual lookup ("what is X?", "show me Y") | Information request |
| Plan approval flow — use `ExitPlanMode`, not `AskUserQuestion` | Different tool for that case |
| Continuation of a workflow whose decisions were ALL answered in a prior `AskUserQuestion` THIS session | Re-asking same questions = nagging |
| User unambiguously stated the decision in chat prose THIS session ("use approach X", "skip module Y", "the file is Z") — no reasonable alternative interpretation | Prose-answered = answered. The structured-tool contract is for *new* unresolved decisions, not replaying decisions the user already made. |

For the last two cases: if prior answers fully determine the next step — whether captured in a structured `AskUserQuestion` artifact OR stated unambiguously by the user in chat prose THIS session — just execute. A NEW decision branching off (one not covered by the prior answer) triggers a fresh `AskUserQuestion`. **The threshold is "unambiguous"** — if you'd need to guess between two reasonable interpretations of the user's prose, ask. The "in doubt" bias from the *How to apply* section above applies to *new* decisions only; previously-stated intent (whether via structured answer or unambiguous prose) is "out of doubt" by definition.

## Related

- `ask-before-deciding.md` — global baseline (this file extends it)
- `~/.claude/CLAUDE.md` priority #2 — "Mandatory: Use AskUserQuestion"

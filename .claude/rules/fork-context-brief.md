---

origin: theonekit-core
repository: The1Studio/theonekit-core
module: null
protected: true
---
# Fork Context Brief (FCB) — Resolve Before You Ask

When invoking a forked skill (`context: fork`), `Agent`, or `TeamCreate`, the receiver runs with ZERO prior conversation history. Ambiguous references (`"the plan above"`, `"plan B"`, `"that report"`) cannot be resolved unless explicitly provided — the receiver will round-trip ("I don't see X") or hallucinate.

Full spec — Brief format, worked examples, security validation, resolution algorithm: [`skills/t1k-resolve-context/references/fcb-protocol.md`](../skills/t1k-resolve-context/references/fcb-protocol.md). Kept out of the auto-loaded rule corpus to fit the session context budget.

## Rule 1 — SENDER side

**Before invoking any fork, if the user's prompt contains ambiguous references, you MUST construct a Fork Context Brief and embed it in the prompt.**

| User phrasing contains... | Embed Brief? |
|---|---|
| `above`, `previous`, `that`, `this`, `the one`, `as we discussed` | Yes — always |
| `plan A/B/C`, `option N`, `round N`, `phase N` (no path) | Yes |
| Pronouns to prior artifacts (`it`, `them`, `they`) | Yes |
| Explicit file path or self-contained noun phrase | No — pass through |
| Pure factual question | No |

Use `/t1k:resolve-context` to automate Brief construction.

## Rule 2 — RECEIVER side

**Before responding "I don't see X" to any ambiguous reference, you MUST attempt resolution from local signals.** Asking is the LAST resort.

Resolution order (stop when unambiguous):

1. Validated Brief (if present — see protocol spec for trust checks)
2. Recent plans / reports (`find plans/ -mmin -120`)
3. Recent git activity (`git log --since="2 hours ago"`)
4. Current session transcript (`~/.claude/projects/{slug}/*.jsonl`)
5. User memory (`MEMORY.md`) + project `CLAUDE.md`
6. Only then → ask the user

## How to apply

- Every skill body with `context: fork` should reference this rule in its `Pre-flight` section.
- Every agent body using `Agent` or `TeamCreate` should follow Rule 1 when constructing prompts.

## Related

- [`orchestration-rules.md`](orchestration-rules.md) — Context Isolation Principle (the constraint this navigates)
- [`always-ask-on-unresolved.md`](always-ask-on-unresolved.md) — when asking is unavoidable after resolution fails
- `skills/t1k-resolve-context/` — automates Rule 2 for senders building a Brief
- `skills/t1k-resolve-context/references/fcb-protocol.md` — full protocol spec
- `hooks/check-ambiguous-fork-invocation.cjs` — detects ambiguous `/t1k:*` invocations

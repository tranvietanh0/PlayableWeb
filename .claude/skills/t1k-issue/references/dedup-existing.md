---

origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-maintainer
protected: true
---
# Dedup — Check for Existing Issues Before Filing

Use this when: before any `gh issue create` call, both manual and auto-mode. Dedup is MANDATORY — never skip it.

## Why

Duplicate issues fragment discussion, inflate counts, and waste maintainer time. A single issue with a "new occurrence" comment is far more useful.

## Search strategy

**MCP (preferred):**
```
search_issues(query="in:title {skill-name}", owner="{owner}", repo="{repo}")
```

**gh CLI fallback:**
```bash
gh issue list \
  --repo {owner}/{repo} \
  --search "in:title {skill-name}" \
  --state open \
  --json number,title,url
```

## Match criteria

An issue is a duplicate if:
- Title matches pattern `fix({kit}):` or `fix({kit}/{module}):` AND
- Title contains the affected skill name

Case-insensitive match is acceptable.

## If a duplicate is found — add a comment instead

**MCP:**
```
add_issue_comment(owner, repo, issue_number, body)
```

**gh CLI:**
```bash
gh issue comment {number} --repo {owner}/{repo} --body "..."
```

**Comment body (new occurrence):**
```markdown
**New occurrence** — {ISO timestamp}

**Fingerprint:** `{fingerprint}` (if from auto-mode)
**Session context:** {short description of what triggered this recurrence}
**Evidence:**
```
{sanitized logs}
```
```

## If no duplicate found

Proceed to create a new issue via `references/file-from-marker.md` or `references/file-manual.md`.

## Local dedup cache (manual AND auto-mode)

After filing ANY issue (manual or auto), write to the shared dedup cache:
```js
// from .claude/hooks/lib/kit-error-dedup.cjs
markSubmitted(fingerprint, issueUrl)
```
This prevents re-filing within `autoIssueSubmission.dedupeTTLDays` days even if the GitHub search is slow.

For **auto-mode**: use the fingerprint from the queue entry (already computed by `lesson-collector.cjs`).

For **manual mode**: compute a fresh fingerprint using `fingerprint({ tool: 'manual-issue', cmd: '', stderrHead: issueTitle.slice(0,100) }, { reason: label, originKit: kit })`. See `references/file-manual.md` § "After filing — populate dedup cache" for the full invocation.

**Why this matters:** Manual and auto filings share the same cache file (`~/.claude/.lesson-fingerprints.json`). A manual filing that populates the cache prevents the auto-pipeline from re-filing the same bug in a future session. This integration closes the manual-vs-auto dedup gap (issue #164).

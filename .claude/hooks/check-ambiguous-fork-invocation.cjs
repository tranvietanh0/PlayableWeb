#!/usr/bin/env node
// t1k-origin: kit=theonekit-core | repo=The1Studio/theonekit-core | module=null | protected=true
// check-ambiguous-fork-invocation.cjs — UserPromptSubmit hook
//
// Purpose:
//   Detect /t1k:* slash-command invocations that target forked-context skills
//   AND contain ambiguous reference words (e.g. "above", "plan B", "that one").
//   Forked skills run in a fresh subagent with ZERO prior conversation history,
//   so unresolved references cause the receiver to either say "I don't see X"
//   (round-trip waste) or hallucinate (silent wrong output). This hook nudges
//   Claude to RESOLVE the references first — via the t1k:resolve-context skill
//   or by manually constructing a Fork Context Brief per rules/fork-context-brief.md.
//
// Trigger:
//   UserPromptSubmit — runs on every user prompt before the model sees it.
//
// Output:
//   - If forked-skill invocation AND ambiguity match AND no explicit path arg
//     → emit a single [t1k:fork-brief-reminder] line to stdout (the harness
//     surfaces stdout from UserPromptSubmit hooks as system-reminder text).
//   - Otherwise → silent (no stdout).
//
// Fail-open behavior (per rules/security.md):
//   - Any internal exception is swallowed; log to stderr and exit 0.
//   - This hook NEVER blocks the prompt (never returns exit code 2).
//     It is RESOLUTIVE (nudges Claude to resolve) not INTERROGATIVE (does not ask).
//
// Related:
//   - rules/fork-context-brief.md — the FCB protocol this hook enforces
//   - skills/t1k-resolve-context/SKILL.md — helper skill for senders
//
// Self-tests (verbatim expected behavior):
//   echo '{"prompt":"/t1k:team review plan B above","cwd":"/tmp"}'           → emits reminder
//   echo '{"prompt":"/t1k:team plans/x/plan.md above"}'                       → silent (explicit path)
//   echo '{"prompt":"/t1k:cook plans/260523-1224-x/","cwd":"/tmp"}'           → silent (path arg)
//   echo '{"prompt":"what time is it","cwd":"/tmp"}'                          → silent
//   echo '{"prompt":"/t1k:fix bug above"}'                                    → silent (t1k:fix is not context:fork)
'use strict';

try {
  const fs = require('fs');
  const path = require('path');

  // ---------------------------------------------------------------------------
  // Discover forked-context skills at hook startup by scanning the kit's
  // skills directory for `context: fork` in SKILL.md frontmatter. Per
  // ~/.claude/rules/code-conventions.md "Data-Driven Over Hardcoded" — the
  // allowlist is the ground truth, not a duplicated literal.
  //
  // Search order (first hit wins): $CLAUDE_PROJECT_DIR/.claude/skills, then
  // $HOME/.claude/skills (global), then bail with empty set.
  // Scan completes in <15ms on ~60 skills (synchronous readdir is fine).
  // ---------------------------------------------------------------------------
  function discoverForkedSkills() {
    const candidates = [
      process.env.CLAUDE_PROJECT_DIR ? path.join(process.env.CLAUDE_PROJECT_DIR, '.claude', 'skills') : null,
      process.env.HOME ? path.join(process.env.HOME, '.claude', 'skills') : null,
    ].filter(Boolean);
    const found = new Set();
    for (const root of candidates) {
      if (!fs.existsSync(root)) continue;
      let entries;
      try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const skillFile = path.join(root, e.name, 'SKILL.md');
        if (!fs.existsSync(skillFile)) continue;
        let head;
        try { head = fs.readFileSync(skillFile, 'utf-8').slice(0, 1500); } catch { continue; }
        // Frontmatter only (between leading `---` markers); skip body
        const fmEnd = head.indexOf('\n---', 3);
        const fm = fmEnd > 0 ? head.slice(0, fmEnd) : head;
        if (!/^\s*context:\s*fork\s*$/m.test(fm)) continue;
        const nameMatch = fm.match(/^\s*name:\s*([t1k][^\s]+)/m);
        if (nameMatch) found.add(nameMatch[1].toLowerCase());
      }
    }
    return found;
  }

  // ---------------------------------------------------------------------------
  // Ambiguity patterns — case-insensitive. Each pattern is anchored on word
  // boundaries to limit false positives (e.g. "above" but not "aboveboard").
  // ---------------------------------------------------------------------------
  const AMBIGUITY_PATTERNS = [
    /\babove\b/i,
    /\bbelow\b/i,
    /\bprevious\b/i,
    /\bthe one\b/i,
    /\bthat (plan|report|file|idea|approach|option|fix|bug|change)\b/i,
    /\bplan [a-z](?![a-z])/i,
    /\bas (we|i) (discussed|said|agreed)\b/i,
    /\bjust (made|created|wrote|drafted)\b/i,
    /\bwe (just|already)\b/i,
  ];
  // Patterns that are AMBIGUOUS only without a path arg (ordinal phrases).
  // We keep these separate so the path-suppression logic stays explicit.
  const ORDINAL_PATTERNS = [
    /\boption [0-9]+\b/i,
    /\bround [0-9]+\b/i,
    /\bphase [0-9]+\b/i,
    /\blast\b/i,
  ];

  // ---------------------------------------------------------------------------
  // Counter-pattern: does the prompt include an EXPLICIT artifact reference?
  // If yes, suppress the reminder — the user already gave grounding.
  //  - file path (relative or absolute)
  //  - markdown / json / cjs / ts / py / sh file extension
  //  - explicit flag args like --file or --plan
  //  - URL
  // ---------------------------------------------------------------------------
  function hasExplicitPath(text) {
    return (
      /\b(?:\.{1,2}\/|\/)?[A-Za-z0-9_.-]*\/[A-Za-z0-9._\/-]+/.test(text) || // a/b/c path
      /\b[\w-]+\.(md|json|cjs|ts|tsx|js|jsx|py|sh|yml|yaml|toml)\b/i.test(text) || // file.ext
      /--(file|plan|path|dir|report|spec)[=\s]/i.test(text) || // --flag
      /https?:\/\/\S+/i.test(text) // url
    );
  }

  // ---------------------------------------------------------------------------
  // Read stdin JSON: { prompt, session_id, transcript_path, cwd, ... }
  // ---------------------------------------------------------------------------
  let payload = {};
  try {
    const raw = fs.readFileSync(0, 'utf-8');
    if (raw && raw.trim()) payload = JSON.parse(raw);
  } catch {
    process.exit(0); // unreadable stdin → silent
  }

  const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
  if (!prompt) process.exit(0);

  // ---------------------------------------------------------------------------
  // Detect forked-skill invocation. Must START with /t1k:<name>.
  // ---------------------------------------------------------------------------
  const slashMatch = prompt.match(/^\/(t1k:[a-z0-9-]+)(?:\s|$)/i);
  if (!slashMatch) process.exit(0);
  const command = slashMatch[1].toLowerCase();
  const forked = discoverForkedSkills();
  if (forked.size === 0 || !forked.has(command)) process.exit(0);

  // ---------------------------------------------------------------------------
  // Skip if the prompt is itself a Brief — user already supplied grounding.
  // ---------------------------------------------------------------------------
  if (/=== FORK CONTEXT BRIEF ===/.test(prompt)) process.exit(0);

  // ---------------------------------------------------------------------------
  // Skip if the user supplied an explicit artifact reference (path / file).
  // ORDINAL_PATTERNS only apply when no path is present (phase 2 + plans/x/
  // means the path disambiguates).
  // ---------------------------------------------------------------------------
  const explicitPath = hasExplicitPath(prompt);

  const matches = [];
  for (const pat of AMBIGUITY_PATTERNS) {
    const m = prompt.match(pat);
    if (m && !matches.includes(m[0].toLowerCase())) {
      matches.push(m[0].toLowerCase());
      if (matches.length >= 3) break;
    }
  }
  if (!explicitPath) {
    for (const pat of ORDINAL_PATTERNS) {
      if (matches.length >= 3) break;
      const m = prompt.match(pat);
      if (m && !matches.includes(m[0].toLowerCase())) matches.push(m[0].toLowerCase());
    }
  }
  if (matches.length === 0) process.exit(0);
  if (explicitPath && matches.length === 0) process.exit(0);

  // ---------------------------------------------------------------------------
  // Emit reminder. Single line so the harness surfaces it cleanly.
  // ---------------------------------------------------------------------------
  const quoted = matches.map((s) => `"${s}"`).join(', ');
  const reminder =
    `[t1k:fork-brief-reminder] /${command} invocation contains ambiguous references (${quoted}). ` +
    `Forked skills cannot see prior conversation. BEFORE invoking, call the t1k:resolve-context skill ` +
    `OR manually construct a Fork Context Brief per rules/fork-context-brief.md Rule 1. ` +
    `Resolutive over interrogative — do not pass the prompt through as-is.`;
  console.log(reminder);
  process.exit(0);
} catch (e) {
  try { process.stderr.write(`[check-ambiguous-fork-invocation] crash: ${e && e.message ? e.message : e}\n`); } catch { /* ok */ }
  process.exit(0); // fail-open
}

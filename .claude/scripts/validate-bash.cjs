#!/usr/bin/env node
// t1k-origin: kit=theonekit-core | repo=The1Studio/theonekit-core | module=null | protected=true
/**
 * validate-bash.cjs — PreToolUse:Bash hook
 *
 * Blocks Bash commands that touch build artifacts, VCS internals, and secrets.
 * Reads forbidden patterns from config/forbidden-patterns.json (sibling config dir).
 *
 * Hook protocol (Claude Code):
 *   stdin  → JSON: { "tool_name": "Bash", "tool_input": { "command": "..." }, ... }
 *   exit 0 → allow the command
 *   exit 2 → block the command (stderr message shown to Claude Code)
 *
 * Cross-platform: Node.js built-ins only. No bash dependency. No npm deps.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ── Config resolution ────────────────────────────────────────────────────────
// __dirname = .claude/modules/t1k-base-bash-validator/scripts/
// config    = .claude/modules/t1k-base-bash-validator/config/forbidden-patterns.json
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'forbidden-patterns.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Fail-open: if config is missing or malformed, don't block any commands.
    process.stderr.write(`[t1k:bash-validator] WARNING: could not load config at ${CONFIG_PATH}: ${err.message}\n`);
    return null;
  }
}

// ── Stdin parsing ────────────────────────────────────────────────────────────
function parseStdin() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const hookData = parseStdin();

// If we can't parse stdin or this isn't a Bash call, allow through.
if (!hookData) process.exit(0);

const { tool_name: toolName, tool_input: toolInput } = hookData;
if (toolName !== 'Bash' || !toolInput || typeof toolInput.command !== 'string') {
  process.exit(0);
}

const command = toolInput.command;

const config = loadConfig();
if (!config) {
  // Fail-open: broken config file → allow the command.
  process.exit(0);
}

const forbiddenPatterns = Array.isArray(config.forbidden) ? config.forbidden : [];
const allowedOverrides = Array.isArray(config.allowed_overrides) ? config.allowed_overrides : [];

// Check allowed_overrides first — if the command is explicitly permitted, skip all checks.
for (const overrideRaw of allowedOverrides) {
  try {
    if (new RegExp(overrideRaw).test(command)) {
      process.exit(0);
    }
  } catch {
    // Malformed override regex — skip it.
  }
}

// Check forbidden patterns.
for (const patternRaw of forbiddenPatterns) {
  let matched = false;
  try {
    matched = new RegExp(patternRaw).test(command);
  } catch {
    // Malformed pattern — skip it.
    process.stderr.write(`[t1k:bash-validator] WARNING: invalid regex pattern "${patternRaw}" — skipped\n`);
    continue;
  }

  if (matched) {
    process.stderr.write(
      `[t1k:bash-blocked] command matches pattern: ${patternRaw}\n` +
      `  command: ${command.length > 120 ? command.slice(0, 120) + '...' : command}\n` +
      `  To allow this command, add an override to:\n` +
      `  ${CONFIG_PATH}\n` +
      `  e.g. add "${patternRaw}" to the "allowed_overrides" array.\n`
    );
    process.exit(2);
  }
}

// All patterns passed — allow the command.
process.exit(0);

#!/usr/bin/env node
// t1k-origin: kit=theonekit-core | repo=The1Studio/theonekit-core | module=null | protected=true
// descriptive-name.cjs — PreToolUse hook on Write: blocks if new files don't follow naming conventions
// Exit 2 = block (requires user approval to proceed). Fail-open on errors.
'use strict';
try {
  const path = require('path');
  const { parseHookStdin } = require('./telemetry-utils.cjs');

  const input = parseHookStdin();
  if (!input) process.exit(0);

  const filePath = (input.tool_input || {}).file_path || '';
  if (!filePath) process.exit(0);
  const basename = path.basename(filePath);
  const ext = path.extname(basename).toLowerCase();
  // Strip all compound extensions: foo.test.cjs → foo, foo.handler.ts → foo
  const COMPOUND_SUFFIXES = [
    '.test', '.spec', '.stories', '.story', '.config', '.d',
    // Common architectural / framework suffixes
    '.handler', '.controller', '.service', '.repository', '.middleware',
    '.guard', '.interceptor', '.pipe', '.decorator', '.module',
    '.routes', '.route', '.client', '.server',
    '.dto', '.entity', '.model', '.schema', '.types', '.type',
    '.helper', '.helpers', '.utils', '.util', '.constants', '.constant',
    '.factory', '.adapter', '.provider', '.context', '.hook', '.hooks',
    '.store', '.mapper', '.reducer', '.action', '.selector',
  ];
  let name = basename.slice(0, -ext.length);
  for (const suffix of COMPOUND_SUFFIXES) {
    if (name.toLowerCase().endsWith(suffix)) { name = name.slice(0, -suffix.length); break; }
  }

  // Extensions to skip (no convention enforced)
  const SKIP_EXTS = new Set(['.md', '.json', '.yml', '.yaml', '.txt', '.env',
    '.gitignore', '.gitattributes', '.editorconfig', '.prettierrc', '.eslintrc',
    '.babelrc', '.nvmrc', '', '.lock', '.log', '.xml', '.csv', '.toml']);
  if (SKIP_EXTS.has(ext)) process.exit(0);

  // Extensions that require kebab-case
  const KEBAB_EXTS = new Set(['.js', '.ts', '.cjs', '.mjs',
    '.sh', '.bash', '.zsh']);

  // Extensions that require PascalCase
  // .php placed here per modern PSR-1/4 (filename matches class name).
  // Procedural PHP (kebab/snake) will trip — accept that tradeoff for now.
  const PASCAL_EXTS = new Set(['.cs', '.java', '.kt', '.swift', '.fs', '.vb', '.php']);

  // Extensions that require snake_case
  // Python (PEP 8), Ruby (Rails/RSpec) join Go and Rust here.
  const SNAKE_EXTS = new Set(['.go', '.rs', '.py', '.rb']);

  // Extensions accepting EITHER kebab-case (utility) OR PascalCase (component).
  // React/JSX components are PascalCase by convention; utility/page files are
  // typically kebab-case. Both are common in the same project.
  const KEBAB_OR_PASCAL_EXTS = new Set(['.jsx', '.tsx']);

  function isKebabCase(s) {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
  }

  function isPascalCase(s) {
    // Allow C# partial-class convention: ClassName.PartName(.PartName)*
    // (e.g. BackpackCrawlerSceneSetup.MetaUI.cs). Each segment must be PascalCase.
    return /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/.test(s);
  }

  // Allow leading/trailing underscores so dunder names like `__init__` and
  // private helpers like `_internal_state` pass — both are PEP 8-legitimate.
  function isSnakeCase(s) {
    return /^_*[a-z0-9]+(_[a-z0-9]+)*_*$/.test(s);
  }

  function toKebab(s) {
    return s
      .replace(/([A-Z])/g, '-$1')
      .replace(/_/g, '-')
      .replace(/--+/g, '-')
      .toLowerCase()
      .replace(/^-/, '');
  }

  let violated = false;
  let message = '';

  if (KEBAB_EXTS.has(ext)) {
    if (!isKebabCase(name)) {
      violated = true;
      const suggestion = toKebab(name);
      message = `naming: '${basename}' should use kebab-case. Suggested: '${suggestion}${ext}'`;
    }
  } else if (PASCAL_EXTS.has(ext)) {
    if (!isPascalCase(name)) {
      violated = true;
      message = `naming: '${basename}' should use PascalCase (e.g., 'MyClass${ext}')`;
    }
  } else if (SNAKE_EXTS.has(ext)) {
    if (!isSnakeCase(name)) {
      violated = true;
      message = `naming: '${basename}' should use snake_case (e.g., 'my_module${ext}')`;
    }
  } else if (KEBAB_OR_PASCAL_EXTS.has(ext)) {
    if (!isKebabCase(name) && !isPascalCase(name)) {
      violated = true;
      message = `naming: '${basename}' should use kebab-case (utility/page) or PascalCase (component)`;
    }
  }

  if (violated) {
    // Exit 2 = warn, not block (Claude Code treats exit 2 as advisory)
    console.log(JSON.stringify({
      decision: 'block',
      reason: `descriptive-name: ${message}`,
    }));
    process.exit(2);
  }

  process.exit(0);
} catch (e) {
  process.exit(0); // fail-open
}

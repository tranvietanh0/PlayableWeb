#!/usr/bin/env node
// t1k-origin: kit=theonekit-cocos | repo=The1Studio/theonekit-cocos | module=base | protected=false
'use strict';

// Tool requirements for the Cocos adapter.
// mermaid-cli: global install (renders all diagrams)
// ts-morph + dependency-cruiser: per-project (version-locked to the target project's TypeScript)
const requirements = [
  {
    tool: 'mermaid-cli',
    scope: 'global',
    checkCommand: 'mmdc --version',
    installHint: 'npm install -g @mermaid-js/mermaid-cli'
  },
  {
    tool: 'ts-morph',
    scope: 'per-project',
    checkCommand: "node -e \"require('ts-morph')\"",
    installHint: 'npm i --save-dev ts-morph'
  },
  {
    tool: 'dependency-cruiser',
    scope: 'per-project',
    checkCommand: 'npx --no-install depcruise --version',
    installHint: 'npm i --save-dev dependency-cruiser'
  }
];

process.stdout.write(JSON.stringify(requirements, null, 2) + '\n');
process.exit(0);

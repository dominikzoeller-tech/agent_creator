const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};

write('README_PHASE108_3.md', `# Phase 108.3 Final Handoff

Status: final handoff for Phase 108 security/audit chain.

## Goal

Document the completed Phase 108 block with short route/script naming and preserve the safety invariants.

## Safety invariants

- provider = none
- modelSelected = none
- dryRunOnly = true
- finalDispatchBlocked = true
- executionGateClosed = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- humanApprovalTokenIssued = false
- humanApprovalTokenActivated = false
- humanApprovalTokenConsumed = false
- promptPayloadPresent = false
- secretsPresent = false
- providerResponsePresent = false

## Naming rule

Use short names only:

- p108-0
- p108-1
- p108-2-dash
- p108-3

No long route, API, store, ZIP, script, or smoke filenames.

## Next phase

Continue with Phase 109.0.
`);

write('scripts/v108-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE108_3.md', 'Phase 108.3 Final Handoff'],
  ['README_PHASE108_3.md', 'provider = none'],
  ['README_PHASE108_3.md', 'modelSelected = none'],
  ['README_PHASE108_3.md', 'dryRunOnly = true'],
  ['README_PHASE108_3.md', 'finalDispatchBlocked = true'],
  ['README_PHASE108_3.md', 'networkCallAllowed = false'],
  ['README_PHASE108_3.md', 'providerDispatchAllowed = false'],
  ['package.json', 'phase108:3:verify'],
  ['package.json', 'llm:p108:final:check']
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file, fragment);
}
console.log('Phase 108.3 verification OK.');
`);

write('scripts/f108-3.cjs', `const fs = require('fs');
const file = 'README_PHASE108_3.md';
if (!fs.existsSync(file)) throw new Error('Missing ' + file);
const text = fs.readFileSync(file, 'utf8');
const required = [
  'Phase 108.3 Final Handoff',
  'Safety invariants',
  'provider = none',
  'networkCallAllowed = false',
  'providerDispatchAllowed = false',
  'Continue with Phase 109.0'
];
for (const item of required) {
  if (!text.includes(item)) throw new Error('Missing final handoff item: ' + item);
  console.log('OK final', item);
}
console.log('Phase 108.3 final check OK.');
`);

const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase108:3:verify'] = 'node scripts/v108-3.cjs';
pkg.scripts['llm:p108:final:check'] = 'node scripts/f108-3.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('UPDATED package.json scripts phase108:3:verify and llm:p108:final:check');
console.log('Phase 108.3 patch applied.');
const fs = require('fs');
const checks = [
  ['README_PHASE107_3.md', 'Phase 107.3 Final Handoff'],
  ['README_PHASE107_3.md', '/p107-0'],
  ['README_PHASE107_3.md', '/p107-1'],
  ['README_PHASE107_3.md', '/p107-2-dash'],
  ['README_PHASE107_3.md', 'provider=none'],
  ['README_PHASE107_3.md', 'modelSelected=none'],
  ['README_PHASE107_3.md', 'dryRunOnly=true'],
  ['README_PHASE107_3.md', 'networkCallAllowed=false'],
  ['README_PHASE107_3.md', 'providerDispatchAllowed=false'],
  ['README_PHASE107_3.md', 'externalDataTransferAllowed=false'],
  ['README_PHASE107_3.md', 'policyDecision=blocked-dry-run-only'],
  ['README_PHASE107_3.md', 'Phase 108.0'],
];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) throw new Error('Missing ' + file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file);
}
console.log('Phase 107.3 final check OK.');

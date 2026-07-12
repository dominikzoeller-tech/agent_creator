
const fs = require('fs');
const path = require('path');
const root = process.cwd();

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\n'), 'utf8');
  console.log(`wrote ${relPath}`);
}
function readJson(relPath) { return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8')); }
function writeJson(relPath, value) { fs.writeFileSync(path.join(root, relPath), JSON.stringify(value, null, 2) + '\n', 'utf8'); console.log(`updated ${relPath}`); }
function addScripts() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase57:3:verify'] = 'node scripts/phase57-3-verify-final-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.cjs';
  pkg.scripts['llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit:final:check'] = 'node scripts/phase57-3-verify-final-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.cjs';
  writeJson('package.json', pkg);
}

const handoff = `# Phase 57.3 Final Handoff - Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Boundary Policy & Audit

## Status
Phase 57.0, 57.1 and 57.2 are closed when verify/build are green.

## Finalized surface
- Closure finalization seal boundary route
- Closure finalization seal boundary policy audit route
- Closure finalization seal boundary policy audit dashboard
- Static / dry-run policy evidence only

## Required invariants
- no real provider call
- no network call
- no provider dispatch
- no active token binding
- final dispatch remains blocked
- execution gate remains closed
- human approval token is not issued
- human approval token is not activated
- human approval token is not consumed
- approval candidate is not approved
- approval candidate is not executed
- no prompt payload
- no secrets
- no provider response
- provider=none
- modelSelected=none
- dryRunOnly=true

## Next phase
Phase 58.0 - Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Receipt
`;

const release = `# Release Summary - Phase 57 Final

## Name
Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Seal Boundary Policy Audit Handoff

## Summary
Final documentation handoff for the acknowledgement completion receipt closure finalization seal boundary policy audit and dashboard block. This handoff does not enable dispatch, token activation, provider invocation, network calls, prompt payloads, secrets, or provider responses.

## Expected checks
- npm run phase57:3:verify
- npm run llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit:final:check
- npm run build
`;

const verify = `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md',
  'docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-release-summary.md',
  'package.json',
];
const fragments = [
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md', 'provider=none'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md', 'modelSelected=none'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md', 'dryRunOnly=true'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md', 'final dispatch remains blocked'],
  ['docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-release-summary.md', 'does not enable dispatch'],
  ['package.json', 'phase57:3:verify'],
  ['package.json', 'llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit:final:check'],
];
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; }
  else console.log('OK ' + file);
}
for (const [file, fragment] of fragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) { console.error('MISSING FRAGMENT ' + fragment + ' in ' + file); failed = true; }
  else console.log('OK fragment ' + fragment);
}
if (failed) process.exit(1);
console.log('Phase 57.3 final handoff verification OK.');
`;

writeFile('docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.md', handoff);
writeFile('docs/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-release-summary.md', release);
writeFile('scripts/phase57-3-verify-final-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-seal-boundary-policy-audit-handoff.cjs', verify);
addScripts();
console.log('Phase 57.3 patch applied. Next: npm run phase57:3:verify && npm run build');

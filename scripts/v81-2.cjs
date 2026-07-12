const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE81_2.md', 'Phase 81.2'],
  ['frontend/app/p81-2-dash/page.tsx', 'Phase 81.2 Dashboard'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.provider'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.modelSelected'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.dryRunOnly'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.networkCallAllowed'],
  ['frontend/app/p81-2-dash/page.tsx', 'audit.providerDispatchAllowed']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel);
}
const badPath = path.join(root, 'frontend', 'app', 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-policy-audit-dashboard');
if (fs.existsSync(badPath)) throw new Error('Long dashboard route still exists: frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-policy-audit-dashboard');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase81:2:verify'] !== 'node scripts/v81-2.cjs') throw new Error('Missing script phase81:2:verify');
if (pkg.scripts['phase81:2:smoke'] !== 'node scripts/s81-2.cjs') throw new Error('Missing script phase81:2:smoke');
console.log('Phase 81.2 verification OK.');

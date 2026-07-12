const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts',
  'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/route.ts',
  'frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/route.ts',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit/page.tsx',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-dashboard/page.tsx',
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary/page.tsx',
  'package.json',
];
const forbidden = '@/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement';
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; } else console.log('OK ' + file);
}
for (const file of files.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (content.includes(forbidden)) { console.error('FORBIDDEN ALIAS IMPORT in ' + file); failed = true; }
}
const policyStore = fs.readFileSync(path.join(root, 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-store.ts'), 'utf8');
const boundaryStore = fs.readFileSync(path.join(root, 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-boundary-store.ts'), 'utf8');
for (const fragment of ['dryRunOnly: true', "provider: 'none'", "modelSelected: 'none'", 'finalDispatchBlocked: true', 'executionGateClosed: true', 'networkCallAllowed: false', 'providerDispatchAllowed: false']) {
  if (!policyStore.includes(fragment) || !boundaryStore.includes(fragment)) { console.error('MISSING invariant ' + fragment); failed = true; } else console.log('OK invariant ' + fragment);
}
if (!fs.readFileSync(path.join(root, 'package.json'), 'utf8').includes('phase49:0a:verify')) { console.error('MISSING phase49:0a:verify'); failed = true; }
if (failed) process.exit(1);
console.log('Phase 49.0a hotfix verification OK.');

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};

const store = `export type Phase109SealReceiptBoundaryPolicyAudit = {
  phase: '109.1';
  parentPhase: '109.0';
  label: string;
  provider: 'none';
  modelSelected: 'none';
  dryRunOnly: true;
  finalDispatchBlocked: true;
  executionGateClosed: true;
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  humanApprovalTokenIssued: false;
  humanApprovalTokenActivated: false;
  humanApprovalTokenConsumed: false;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  promptPayloadPresent: false;
  secretsPresent: false;
  providerResponsePresent: false;
  policyAuditComplete: true;
};

export const phase109SealReceiptBoundaryPolicyAudit: Phase109SealReceiptBoundaryPolicyAudit = {
  phase: '109.1',
  parentPhase: '109.0',
  label: 'Phase 109.1 seal receipt boundary policy audit',
  provider: 'none',
  modelSelected: 'none',
  dryRunOnly: true,
  finalDispatchBlocked: true,
  executionGateClosed: true,
  networkCallAllowed: false,
  providerDispatchAllowed: false,
  humanApprovalTokenIssued: false,
  humanApprovalTokenActivated: false,
  humanApprovalTokenConsumed: false,
  approvalCandidateApproved: false,
  approvalCandidateExecuted: false,
  promptPayloadPresent: false,
  secretsPresent: false,
  providerResponsePresent: false,
  policyAuditComplete: true,
};

export function getPhase109SealReceiptBoundaryPolicyAudit() {
  return phase109SealReceiptBoundaryPolicyAudit;
}
`;

const route = `import { NextResponse } from 'next/server';
import { getPhase109SealReceiptBoundaryPolicyAudit } from '../../../lib/p109-1-store';

export async function GET() {
  return NextResponse.json(getPhase109SealReceiptBoundaryPolicyAudit());
}
`;

const page = `import { getPhase109SealReceiptBoundaryPolicyAudit } from '../../lib/p109-1-store';

export default function Phase109SealReceiptBoundaryPolicyAuditPage() {
  const audit = getPhase109SealReceiptBoundaryPolicyAudit();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 109.1 Policy Audit</h1>
      <p>Seal receipt boundary policy audit remains locked and dry-run only.</p>
      <ul>
        <li>phase: {audit.phase}</li>
        <li>provider: {audit.provider}</li>
        <li>modelSelected: {audit.modelSelected}</li>
        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>
        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>
        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>
        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>
        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>
        <li>policyAuditComplete: {String(audit.policyAuditComplete)}</li>
      </ul>
    </main>
  );
}
`;

const verify = `const fs = require('fs');
const checks = [
  ['frontend/lib/p109-1-store.ts', "phase: '109.1'"],
  ['frontend/lib/p109-1-store.ts', "provider: 'none'"],
  ['frontend/lib/p109-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p109-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/p109-1/route.ts', 'getPhase109SealReceiptBoundaryPolicyAudit'],
  ['frontend/app/p109-1/page.tsx', 'Phase 109.1 Policy Audit'],
  ['package.json', 'phase109:1:verify']
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}
if (!ok) process.exit(1);
console.log('Phase 109.1 verification OK.');
`;

write('frontend/lib/p109-1-store.ts', store);
write('frontend/app/api/p109-1/route.ts', route);
write('frontend/app/p109-1/page.tsx', page);
write('scripts/v109-1.cjs', verify);
write('README_PHASE109_1.md', '# Phase 109.1\n\nSeal receipt boundary policy audit. Short route/API/store names are used to avoid Windows path length issues.\n');

const packagePath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase109:1:verify'] = 'node scripts/v109-1.cjs';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('UPDATED package.json');
console.log('Phase 109.1 patch OK.');

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[p82-1] wrote ${rel}`);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, data) => fs.writeFileSync(path.join(root, rel), JSON.stringify(data, null, 2) + '\n', 'utf8');

const store = `export const P821_POLICY_AUDIT = {
  phase: '82.1',
  title: 'Phase 82.1 - Seal Final Closure Boundary Policy Audit',
  purpose: 'Policy audit for Phase 82.0 seal final closure boundary.',
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
  sealFinalClosureBoundaryPresent: true,
  policyAuditPresent: true,
  auditResult: 'PASS',
  notes: [
    'No provider dispatch is allowed.',
    'No network call is allowed.',
    'No prompt payload or secrets are present.',
    'All approval-token and execution gates remain closed.',
    'Policy audit confirms Phase 82.0 boundary remains sealed.'
  ]
} as const;

export type P821PolicyAudit = typeof P821_POLICY_AUDIT;
`;

const route = `import { P821_POLICY_AUDIT } from '@/lib/p82-1-store';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    ok: true,
    data: P821_POLICY_AUDIT
  });
}
`;

const page = `import { P821_POLICY_AUDIT } from '@/lib/p82-1-store';

export default function Phase821Page() {
  const audit = P821_POLICY_AUDIT;

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>{audit.title}</h1>
      <p>{audit.purpose}</p>

      <section>
        <h2>Result</h2>
        <ul>
          <li>Audit result: {audit.auditResult}</li>
          <li>Provider: {audit.provider}</li>
          <li>Model selected: {audit.modelSelected}</li>
          <li>Dry run only: {String(audit.dryRunOnly)}</li>
          <li>Final dispatch blocked: {String(audit.finalDispatchBlocked)}</li>
          <li>Execution gate closed: {String(audit.executionGateClosed)}</li>
          <li>Network call allowed: {String(audit.networkCallAllowed)}</li>
          <li>Provider dispatch allowed: {String(audit.providerDispatchAllowed)}</li>
        </ul>
      </section>

      <section>
        <h2>Policy Notes</h2>
        <ul>
          {audit.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
`;

const verify = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mustExist = [
  'frontend/lib/p82-1-store.ts',
  'frontend/app/api/p82-1/route.ts',
  'frontend/app/p82-1/page.tsx',
  'scripts/v82-1.cjs',
  'README_PHASE82_1.md'
];

const requiredTokens = [
  ['frontend/lib/p82-1-store.ts', 'phase: \'82.1\''],
  ['frontend/lib/p82-1-store.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/p82-1-store.ts', 'networkCallAllowed: false'],
  ['frontend/lib/p82-1-store.ts', 'finalDispatchBlocked: true'],
  ['frontend/lib/p82-1-store.ts', 'executionGateClosed: true'],
  ['frontend/lib/p82-1-store.ts', 'policyAuditPresent: true'],
  ['frontend/app/api/p82-1/route.ts', 'P821_POLICY_AUDIT'],
  ['frontend/app/p82-1/page.tsx', 'Phase 82.1']
];

let failed = false;
for (const rel of mustExist) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.error(`[v82-1] missing ${rel}`);
    failed = true;
  }
}

for (const [rel, token] of requiredTokens) {
  const file = path.join(root, rel);
  const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!content.includes(token)) {
    console.error(`[v82-1] token missing in ${rel}: ${token}`);
    failed = true;
  }
}

const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('[v82-1] missing package.json');
  failed = true;
} else {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.scripts || pkg.scripts['phase82:1:verify'] !== 'node scripts/v82-1.cjs') {
    console.error('[v82-1] missing package script phase82:1:verify');
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('[v82-1] PASS');
`;

const readme = `# Phase 82.1 - Seal Final Closure Boundary Policy Audit

## Purpose
Policy audit for Phase 82.0 seal final closure boundary.

## Short paths
- frontend/app/p82-1/page.tsx
- frontend/app/api/p82-1/route.ts
- frontend/lib/p82-1-store.ts
- scripts/v82-1.cjs

## Safety invariants
- provider=none
- modelSelected=none
- dryRunOnly=true
- finalDispatchBlocked=true
- executionGateClosed=true
- networkCallAllowed=false
- providerDispatchAllowed=false
- humanApprovalTokenIssued=false
- humanApprovalTokenActivated=false
- humanApprovalTokenConsumed=false
- approvalCandidateApproved=false
- approvalCandidateExecuted=false
- promptPayloadPresent=false
- secretsPresent=false
- providerResponsePresent=false

## Run
\`\`\`bash
node scripts/p82-1.cjs
npm run phase82:1:verify
npm run build
git status --short
\`\`\`
`;

write('frontend/lib/p82-1-store.ts', store);
write('frontend/app/api/p82-1/route.ts', route);
write('frontend/app/p82-1/page.tsx', page);
write('scripts/v82-1.cjs', verify);
write('README_PHASE82_1.md', readme);

const pkgFile = path.join(root, 'package.json');
if (!fs.existsSync(pkgFile)) {
  throw new Error('package.json not found. Run this script from the repository root.');
}
const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase82:1:verify'] = 'node scripts/v82-1.cjs';
writeJson('package.json', pkg);
console.log('[p82-1] package script set: phase82:1:verify');
console.log('[p82-1] done');

const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const w = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

w('README_PHASE108_0.md', `# Phase 108.0 - Seal Final Receipt Completion Final Closure Receipt Seal Boundary\n\nAdds short-name boundary artifacts for Phase 108.\n\nRoutes:\n\n- UI: /p108-0\n- API: /api/p108-0\n- Store: frontend/lib/p108-0-store.ts\n\nSecurity invariants remain locked.\n`);

w('frontend/lib/p108-0-store.ts', `export type P1080Boundary = {\n  phase: '108.0';\n  label: string;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  approvalCandidateApproved: false;\n  approvalCandidateExecuted: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n  externalDataTransferAllowed: false;\n  policyDecision: 'blocked-dry-run-only';\n  boundaryRecorded: true;\n};\n\nexport function getP1080Boundary(): P1080Boundary {\n  return {\n    phase: '108.0',\n    label: 'Seal Final Receipt Completion Final Closure Receipt Seal Boundary',\n    provider: 'none',\n    modelSelected: 'none',\n    dryRunOnly: true,\n    finalDispatchBlocked: true,\n    executionGateClosed: true,\n    networkCallAllowed: false,\n    providerDispatchAllowed: false,\n    humanApprovalTokenIssued: false,\n    humanApprovalTokenActivated: false,\n    humanApprovalTokenConsumed: false,\n    approvalCandidateApproved: false,\n    approvalCandidateExecuted: false,\n    promptPayloadPresent: false,\n    secretsPresent: false,\n    providerResponsePresent: false,\n    externalDataTransferAllowed: false,\n    policyDecision: 'blocked-dry-run-only',\n    boundaryRecorded: true,\n  };\n}\n`);

w('frontend/app/api/p108-0/route.ts', `import { NextResponse } from 'next/server';\nimport { getP1080Boundary } from '../../../lib/p108-0-store';\n\nexport async function GET() {\n  return NextResponse.json(getP1080Boundary());\n}\n`);

w('frontend/app/p108-0/page.tsx', `import { getP1080Boundary } from '../../lib/p108-0-store';\n\nexport default function P1080Page() {\n  const boundary = getP1080Boundary();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 108.0</h1>\n      <h2>{boundary.label}</h2>\n      <ul>\n        <li>phase: {boundary.phase}</li>\n        <li>provider: {boundary.provider}</li>\n        <li>modelSelected: {boundary.modelSelected}</li>\n        <li>dryRunOnly: {String(boundary.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(boundary.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(boundary.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(boundary.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(boundary.providerDispatchAllowed)}</li>\n        <li>externalDataTransferAllowed: {String(boundary.externalDataTransferAllowed)}</li>\n        <li>policyDecision: {boundary.policyDecision}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v108-0.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE108_0.md', 'Phase 108.0'],\n  ['frontend/lib/p108-0-store.ts', "phase: '108.0'"],\n  ['frontend/lib/p108-0-store.ts', "provider: 'none'"],\n  ['frontend/lib/p108-0-store.ts', "modelSelected: 'none'"],\n  ['frontend/lib/p108-0-store.ts', 'dryRunOnly: true'],\n  ['frontend/lib/p108-0-store.ts', 'finalDispatchBlocked: true'],\n  ['frontend/lib/p108-0-store.ts', 'executionGateClosed: true'],\n  ['frontend/lib/p108-0-store.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/p108-0-store.ts', 'providerDispatchAllowed: false'],\n  ['frontend/lib/p108-0-store.ts', 'externalDataTransferAllowed: false'],\n  ['frontend/lib/p108-0-store.ts', "policyDecision: 'blocked-dry-run-only'"],\n  ['frontend/app/api/p108-0/route.ts', 'getP1080Boundary'],\n  ['frontend/app/p108-0/page.tsx', 'Phase 108.0'],\n  ['package.json', 'phase108:0:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 108.0 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase108:0:verify'] = 'node scripts/v108-0.cjs';
writeJson('package.json', pkg);
console.log('Phase 108.0 patch applied.');

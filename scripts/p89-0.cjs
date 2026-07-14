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

w('README_PHASE89_0.md', `# Phase 89.0 - Seal Final Closure Receipt Completion Final Receipt\n\nAdds short-name receipt artifacts for the next safe provider dispatch control segment.\n\nRoutes:\n\n- UI: /p89-0\n- API: /api/p89-0\n- Store: frontend/lib/p89-0-store.ts\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n`);

w('frontend/lib/p89-0-store.ts', `export type P890Receipt = {\n  phase: '89.0';\n  priorBoundaryPhase: '88.0';\n  priorPolicyAuditPhase: '88.1';\n  label: string;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n  receiptRecorded: true;\n};\n\nexport function getP890Receipt(): P890Receipt {\n  return {\n    phase: '89.0',\n    priorBoundaryPhase: '88.0',\n    priorPolicyAuditPhase: '88.1',\n    label: 'Seal Final Closure Receipt Completion Final Receipt',\n    provider: 'none',\n    modelSelected: 'none',\n    dryRunOnly: true,\n    finalDispatchBlocked: true,\n    executionGateClosed: true,\n    networkCallAllowed: false,\n    providerDispatchAllowed: false,\n    humanApprovalTokenIssued: false,\n    humanApprovalTokenActivated: false,\n    humanApprovalTokenConsumed: false,\n    promptPayloadPresent: false,\n    secretsPresent: false,\n    providerResponsePresent: false,\n    receiptRecorded: true,\n  };\n}\n`);

w('frontend/app/api/p89-0/route.ts', `import { NextResponse } from 'next/server';\nimport { getP890Receipt } from '../../../lib/p89-0-store';\n\nexport async function GET() {\n  return NextResponse.json(getP890Receipt());\n}\n`);

w('frontend/app/p89-0/page.tsx', `import { getP890Receipt } from '../../lib/p89-0-store';\n\nexport default function P890Page() {\n  const receipt = getP890Receipt();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 89.0</h1>\n      <h2>{receipt.label}</h2>\n      <ul>\n        <li>phase: {receipt.phase}</li>\n        <li>priorBoundaryPhase: {receipt.priorBoundaryPhase}</li>\n        <li>priorPolicyAuditPhase: {receipt.priorPolicyAuditPhase}</li>\n        <li>provider: {receipt.provider}</li>\n        <li>modelSelected: {receipt.modelSelected}</li>\n        <li>dryRunOnly: {String(receipt.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(receipt.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(receipt.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(receipt.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(receipt.providerDispatchAllowed)}</li>\n        <li>receiptRecorded: {String(receipt.receiptRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v89-0.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE89_0.md', 'Phase 89.0'],\n  ['frontend/lib/p89-0-store.ts', "phase: '89.0'"],\n  ['frontend/lib/p89-0-store.ts', "priorBoundaryPhase: '88.0'"],\n  ['frontend/lib/p89-0-store.ts', "provider: 'none'"],\n  ['frontend/lib/p89-0-store.ts', "modelSelected: 'none'"],\n  ['frontend/lib/p89-0-store.ts', 'dryRunOnly: true'],\n  ['frontend/lib/p89-0-store.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/p89-0-store.ts', 'providerDispatchAllowed: false'],\n  ['frontend/app/api/p89-0/route.ts', 'getP890Receipt'],\n  ['frontend/app/p89-0/page.tsx', 'Phase 89.0'],\n  ['package.json', 'phase89:0:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 89.0 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase89:0:verify'] = 'node scripts/v89-0.cjs';
writeJson('package.json', pkg);
console.log('Phase 89.0 patch applied.');

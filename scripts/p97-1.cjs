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

w('README_PHASE97_1.md', `# Phase 97.1 - Completion Final Seal Receipt Policy Audit\n\nAdds short-name policy audit artifacts.\n\nRoutes:\n\n- UI: /p97-1\n- API: /api/p97-1\n- Store: frontend/lib/p97-1-store.ts\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n`);

w('frontend/lib/p97-1-store.ts', `export type P971Audit = {\n  phase: '97.1';\n  receiptPhase: '97.0';\n  label: string;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n  policyAuditRecorded: true;\n};\n\nexport function getP971Audit(): P971Audit {\n  return {\n    phase: '97.1',\n    receiptPhase: '97.0',\n    label: 'Seal Final Closure Receipt Completion Final Seal Receipt Policy Audit',\n    provider: 'none',\n    modelSelected: 'none',\n    dryRunOnly: true,\n    finalDispatchBlocked: true,\n    executionGateClosed: true,\n    networkCallAllowed: false,\n    providerDispatchAllowed: false,\n    humanApprovalTokenIssued: false,\n    humanApprovalTokenActivated: false,\n    humanApprovalTokenConsumed: false,\n    promptPayloadPresent: false,\n    secretsPresent: false,\n    providerResponsePresent: false,\n    policyAuditRecorded: true,\n  };\n}\n`);

w('frontend/app/api/p97-1/route.ts', `import { NextResponse } from 'next/server';\nimport { getP971Audit } from '../../../lib/p97-1-store';\n\nexport async function GET() {\n  return NextResponse.json(getP971Audit());\n}\n`);

w('frontend/app/p97-1/page.tsx', `import { getP971Audit } from '../../lib/p97-1-store';\n\nexport default function P971Page() {\n  const audit = getP971Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 97.1</h1>\n      <h2>{audit.label}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>receiptPhase: {audit.receiptPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v97-1.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE97_1.md', 'Phase 97.1'],\n  ['frontend/lib/p97-1-store.ts', "phase: '97.1'"],\n  ['frontend/lib/p97-1-store.ts', "receiptPhase: '97.0'"],\n  ['frontend/lib/p97-1-store.ts', "provider: 'none'"],\n  ['frontend/lib/p97-1-store.ts', "modelSelected: 'none'"],\n  ['frontend/lib/p97-1-store.ts', 'dryRunOnly: true'],\n  ['frontend/lib/p97-1-store.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/p97-1-store.ts', 'providerDispatchAllowed: false'],\n  ['frontend/app/api/p97-1/route.ts', 'getP971Audit'],\n  ['frontend/app/p97-1/page.tsx', 'Phase 97.1'],\n  ['package.json', 'phase97:1:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 97.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase97:1:verify'] = 'node scripts/v97-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 97.1 patch applied.');

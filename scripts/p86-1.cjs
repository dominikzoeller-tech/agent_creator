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

w('README_PHASE86_1.md', `# Phase 86.1 - Closure Boundary Policy Audit\n\nAdds short-name policy audit artifacts.\n\nRoutes:\n\n- UI: /p86-1\n- API: /api/p86-1\n- Store: frontend/lib/p86-1-store.ts\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n`);

w('frontend/lib/p86-1-store.ts', `export type P861Audit = {\n  phase: '86.1';\n  boundaryPhase: '86.0';\n  label: string;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n  policyAuditRecorded: true;\n};\n\nexport function getP861Audit(): P861Audit {\n  return {\n    phase: '86.1',\n    boundaryPhase: '86.0',\n    label: 'Seal Final Closure Receipt Completion Closure Boundary Policy Audit',\n    provider: 'none',\n    modelSelected: 'none',\n    dryRunOnly: true,\n    finalDispatchBlocked: true,\n    executionGateClosed: true,\n    networkCallAllowed: false,\n    providerDispatchAllowed: false,\n    humanApprovalTokenIssued: false,\n    humanApprovalTokenActivated: false,\n    humanApprovalTokenConsumed: false,\n    promptPayloadPresent: false,\n    secretsPresent: false,\n    providerResponsePresent: false,\n    policyAuditRecorded: true,\n  };\n}\n`);

w('frontend/app/api/p86-1/route.ts', `import { NextResponse } from 'next/server';\nimport { getP861Audit } from '../../../lib/p86-1-store';\n\nexport async function GET() {\n  return NextResponse.json(getP861Audit());\n}\n`);

w('frontend/app/p86-1/page.tsx', `import { getP861Audit } from '../../lib/p86-1-store';\n\nexport default function P861Page() {\n  const audit = getP861Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 86.1</h1>\n      <h2>{audit.label}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>boundaryPhase: {audit.boundaryPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v86-1.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE86_1.md', 'Phase 86.1'],\n  ['frontend/lib/p86-1-store.ts', "phase: '86.1'"],\n  ['frontend/lib/p86-1-store.ts', "boundaryPhase: '86.0'"],\n  ['frontend/lib/p86-1-store.ts', "provider: 'none'"],\n  ['frontend/lib/p86-1-store.ts', "modelSelected: 'none'"],\n  ['frontend/lib/p86-1-store.ts', 'dryRunOnly: true'],\n  ['frontend/lib/p86-1-store.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/p86-1-store.ts', 'providerDispatchAllowed: false'],\n  ['frontend/app/api/p86-1/route.ts', 'getP861Audit'],\n  ['frontend/app/p86-1/page.tsx', 'Phase 86.1'],\n  ['package.json', 'phase86:1:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 86.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase86:1:verify'] = 'node scripts/v86-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 86.1 patch applied.');

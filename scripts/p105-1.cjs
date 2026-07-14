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

w('README_PHASE105_1.md', `# Phase 105.1 - Seal Final Receipt Completion Boundary Policy Audit\n\nAdds short-name policy audit artifacts for Phase 105.\n\nRoutes:\n\n- UI: /p105-1\n- API: /api/p105-1\n- Store: frontend/lib/p105-1-store.ts\n\nSecurity invariants remain locked.\n`);

w('frontend/lib/p105-1-store.ts', `import { getP1050Boundary } from './p105-0-store';\n\nexport type P1051Audit = ReturnType<typeof getP1050Boundary> & {\n  auditPhase: '105.1';\n  auditLabel: string;\n  policyAuditRecorded: true;\n  policyAllowsProviderDispatch: false;\n  policyAllowsNetworkCall: false;\n  policyAllowsExternalDataTransfer: false;\n  policyAllowsPromptPayload: false;\n  policyAllowsSecrets: false;\n};\n\nexport function getP1051Audit(): P1051Audit {\n  return {\n    ...getP1050Boundary(),\n    auditPhase: '105.1',\n    auditLabel: 'Seal Final Receipt Completion Boundary Policy Audit',\n    policyAuditRecorded: true,\n    policyAllowsProviderDispatch: false,\n    policyAllowsNetworkCall: false,\n    policyAllowsExternalDataTransfer: false,\n    policyAllowsPromptPayload: false,\n    policyAllowsSecrets: false,\n  };\n}\n`);

w('frontend/app/api/p105-1/route.ts', `import { NextResponse } from 'next/server';\nimport { getP1051Audit } from '../../../lib/p105-1-store';\n\nexport async function GET() {\n  return NextResponse.json(getP1051Audit());\n}\n`);

w('frontend/app/p105-1/page.tsx', `import { getP1051Audit } from '../../lib/p105-1-store';\n\nexport default function P1051Page() {\n  const audit = getP1051Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 105.1</h1>\n      <h2>{audit.auditLabel}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>auditPhase: {audit.auditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>externalDataTransferAllowed: {String(audit.externalDataTransferAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v105-1.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE105_1.md', 'Phase 105.1'],\n  ['frontend/lib/p105-1-store.ts', "auditPhase: '105.1'"],\n  ['frontend/lib/p105-1-store.ts', 'policyAllowsProviderDispatch: false'],\n  ['frontend/lib/p105-1-store.ts', 'policyAllowsNetworkCall: false'],\n  ['frontend/lib/p105-1-store.ts', 'policyAllowsExternalDataTransfer: false'],\n  ['frontend/lib/p105-1-store.ts', 'policyAllowsPromptPayload: false'],\n  ['frontend/lib/p105-1-store.ts', 'policyAllowsSecrets: false'],\n  ['frontend/app/api/p105-1/route.ts', 'getP1051Audit'],\n  ['frontend/app/p105-1/page.tsx', 'Phase 105.1'],\n  ['package.json', 'phase105:1:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 105.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase105:1:verify'] = 'node scripts/v105-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 105.1 patch applied.');

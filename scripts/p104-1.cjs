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

w('README_PHASE104_1.md', `# Phase 104.1 - Seal Final Closure Final Receipt Seal Final Receipt Boundary Policy Audit\n\nAdds short-name policy audit artifacts for Phase 104.\n\nRoutes:\n\n- UI: /p104-1\n- API: /api/p104-1\n- Store: frontend/lib/p104-1-store.ts\n\nSecurity invariants remain locked.\n`);

w('frontend/lib/p104-1-store.ts', `import { getP1040Boundary } from './p104-0-store';\n\nexport type P1041Audit = ReturnType<typeof getP1040Boundary> & {\n  auditPhase: '104.1';\n  auditLabel: string;\n  policyAuditRecorded: true;\n  externalProviderReviewRequired: false;\n  externalDataTransferAllowed: false;\n};\n\nexport function getP1041Audit(): P1041Audit {\n  const boundary = getP1040Boundary();\n  return {\n    ...boundary,\n    auditPhase: '104.1',\n    auditLabel: 'Seal Final Closure Final Receipt Seal Final Receipt Boundary Policy Audit',\n    policyAuditRecorded: true,\n    externalProviderReviewRequired: false,\n    externalDataTransferAllowed: false,\n  };\n}\n`);

w('frontend/app/api/p104-1/route.ts', `import { NextResponse } from 'next/server';\nimport { getP1041Audit } from '../../../lib/p104-1-store';\n\nexport async function GET() {\n  return NextResponse.json(getP1041Audit());\n}\n`);

w('frontend/app/p104-1/page.tsx', `import { getP1041Audit } from '../../lib/p104-1-store';\n\nexport default function P1041Page() {\n  const audit = getP1041Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 104.1</h1>\n      <h2>{audit.auditLabel}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>auditPhase: {audit.auditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n        <li>externalProviderReviewRequired: {String(audit.externalProviderReviewRequired)}</li>\n        <li>externalDataTransferAllowed: {String(audit.externalDataTransferAllowed)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v104-1.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE104_1.md', 'Phase 104.1'],\n  ['frontend/lib/p104-1-store.ts', "auditPhase: '104.1'"],\n  ['frontend/lib/p104-1-store.ts', 'policyAuditRecorded: true'],\n  ['frontend/lib/p104-1-store.ts', 'externalProviderReviewRequired: false'],\n  ['frontend/lib/p104-1-store.ts', 'externalDataTransferAllowed: false'],\n  ['frontend/app/api/p104-1/route.ts', 'getP1041Audit'],\n  ['frontend/app/p104-1/page.tsx', 'Phase 104.1'],\n  ['package.json', 'phase104:1:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 104.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase104:1:verify'] = 'node scripts/v104-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 104.1 patch applied.');

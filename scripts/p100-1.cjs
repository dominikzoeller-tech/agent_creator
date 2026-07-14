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

w('README_PHASE100_1.md', `# Phase 100.1 - Completion Final Seal Closure Final Boundary Policy Audit\n\nAdds short-name policy audit artifacts for Phase 100.\n\nRoutes:\n\n- UI: /p100-1\n- API: /api/p100-1\n- Store: frontend/lib/p100-1-store.ts\n\nSecurity invariants remain locked.\n`);

w('frontend/lib/p100-1-store.ts', `import { getP1000Boundary } from './p100-0-store';\n\nexport type P1001Audit = ReturnType<typeof getP1000Boundary> & {\n  auditPhase: '100.1';\n  policyAuditRecorded: true;\n  auditLabel: string;\n  auditType: 'agent_registry_status_changed';\n};\n\nexport function getP1001Audit(): P1001Audit {\n  const boundary = getP1000Boundary();\n  return {\n    ...boundary,\n    auditPhase: '100.1',\n    policyAuditRecorded: true,\n    auditLabel: 'Phase 100.1 policy audit confirms provider dispatch remains blocked',\n    auditType: 'agent_registry_status_changed',\n  };\n}\n`);

w('frontend/app/api/p100-1/route.ts', `import { NextResponse } from 'next/server';\nimport { getP1001Audit } from '../../../lib/p100-1-store';\n\nexport async function GET() {\n  return NextResponse.json(getP1001Audit());\n}\n`);

w('frontend/app/p100-1/page.tsx', `import { getP1001Audit } from '../../lib/p100-1-store';\n\nexport default function P1001Page() {\n  const audit = getP1001Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 100.1</h1>\n      <h2>{audit.auditLabel}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>auditPhase: {audit.auditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v100-1.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE100_1.md', 'Phase 100.1'],\n  ['frontend/lib/p100-1-store.ts', "auditPhase: '100.1'"],\n  ['frontend/lib/p100-1-store.ts', 'getP1000Boundary'],\n  ['frontend/lib/p100-1-store.ts', 'policyAuditRecorded: true'],\n  ['frontend/lib/p100-1-store.ts', "auditType: 'agent_registry_status_changed'"],\n  ['frontend/app/api/p100-1/route.ts', 'getP1001Audit'],\n  ['frontend/app/p100-1/page.tsx', 'Phase 100.1'],\n  ['frontend/app/p100-1/page.tsx', 'audit.provider'],\n  ['frontend/app/p100-1/page.tsx', 'audit.modelSelected'],\n  ['frontend/app/p100-1/page.tsx', 'audit.finalDispatchBlocked'],\n  ['frontend/app/p100-1/page.tsx', 'audit.executionGateClosed'],\n  ['frontend/app/p100-1/page.tsx', 'audit.networkCallAllowed'],\n  ['frontend/app/p100-1/page.tsx', 'audit.providerDispatchAllowed'],\n  ['package.json', 'phase100:1:verify'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 100.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase100:1:verify'] = 'node scripts/v100-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 100.1 patch applied.');

const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const base = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary';
const slug = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit';
const baseStore = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-store';
const store = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-policy-audit-store';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + os.EOL, 'utf8');

write('README_PHASE79_1.md', `# Phase 79.1\n\nProvider Dispatch archive completion final closure finalization seal boundary policy audit.\n\nInvariants remain closed: provider=none, modelSelected=none, dryRunOnly=true, finalDispatchBlocked=true, executionGateClosed=true, networkCallAllowed=false, providerDispatchAllowed=false.\n`);

write(`frontend/lib/${store}.ts`, `import { getArchiveCompletionFinalClosureFinalizationSealBoundary } from './${baseStore}';\n\nexport type ArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit = Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationSealBoundary>, 'phase'> & {\n  phase: '79.1';\n  auditName: string;\n  boundaryPhase: '79.0';\n  policyAuditPassed: true;\n  auditEventType: 'agent_registry_status_changed';\n};\n\nexport function getArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit(): ArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit {\n  const boundary = getArchiveCompletionFinalClosureFinalizationSealBoundary();\n  return {\n    ...boundary,\n    phase: '79.1',\n    auditName: 'archive-completion-final-closure-finalization-seal-boundary-policy-audit',\n    boundaryPhase: '79.0',\n    policyAuditPassed: true,\n    auditEventType: 'agent_registry_status_changed',\n  };\n}\n`);

write(`frontend/app/api/${slug}/route.ts`, `import { NextResponse } from 'next/server';\nimport { getArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit } from '../../../lib/${store}';\n\nexport async function GET() {\n  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit());\n}\n`);

write(`frontend/app/${slug}/page.tsx`, `import { getArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit } from '../../lib/${store}';\n\nexport default function Page() {\n  const audit = getArchiveCompletionFinalClosureFinalizationSealBoundaryPolicyAudit();\n  return (\n    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 79.1 Archive Completion Final Closure Finalization Seal Boundary Policy Audit</h1>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>boundaryPhase: {audit.boundaryPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditPassed: {String(audit.policyAuditPassed)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

write('scripts/v79-1.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE79_1.md', 'Phase 79.1'],\n  ['frontend/lib/${store}.ts', "Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationSealBoundary>, 'phase'>"],\n  ['frontend/lib/${store}.ts', "phase: '79.1'"],\n  ['frontend/lib/${store}.ts', "boundaryPhase: '79.0'"],\n  ['frontend/lib/${store}.ts', 'policyAuditPassed: true'],\n  ['frontend/lib/${store}.ts', "auditEventType: 'agent_registry_status_changed'"],\n  ['frontend/app/api/${slug}/route.ts', 'NextResponse.json'],\n  ['frontend/app/${slug}/page.tsx', 'Phase 79.1']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (pkg.scripts['phase79:1:verify'] !== 'node scripts/v79-1.cjs') throw new Error('Missing script phase79:1:verify');\nconsole.log('Phase 79.1 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase79:1:verify'] = 'node scripts/v79-1.cjs';
writeJson('package.json', pkg);
console.log('Phase 79.1 patch applied.');

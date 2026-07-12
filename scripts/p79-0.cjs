const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const slug = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary';
const store = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-boundary-store';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + os.EOL, 'utf8');

write('README_PHASE79_0.md', `# Phase 79.0\n\nProvider Dispatch archive completion final closure finalization seal boundary.\n\nInvariants remain closed: provider=none, modelSelected=none, dryRunOnly=true, finalDispatchBlocked=true, executionGateClosed=true, networkCallAllowed=false, providerDispatchAllowed=false.\n`);

write(`frontend/lib/${store}.ts`, `export type ArchiveCompletionFinalClosureFinalizationSealBoundary = {\n  phase: '79.0';\n  boundaryName: string;\n  priorFinalReceiptClosed: true;\n  sealBoundaryClosed: true;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  approvalCandidateApproved: false;\n  approvalCandidateExecuted: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n};\n\nexport const archiveCompletionFinalClosureFinalizationSealBoundary: ArchiveCompletionFinalClosureFinalizationSealBoundary = {\n  phase: '79.0',\n  boundaryName: 'archive-completion-final-closure-finalization-seal-boundary',\n  priorFinalReceiptClosed: true,\n  sealBoundaryClosed: true,\n  provider: 'none',\n  modelSelected: 'none',\n  dryRunOnly: true,\n  finalDispatchBlocked: true,\n  executionGateClosed: true,\n  networkCallAllowed: false,\n  providerDispatchAllowed: false,\n  humanApprovalTokenIssued: false,\n  humanApprovalTokenActivated: false,\n  humanApprovalTokenConsumed: false,\n  approvalCandidateApproved: false,\n  approvalCandidateExecuted: false,\n  promptPayloadPresent: false,\n  secretsPresent: false,\n  providerResponsePresent: false,\n};\n\nexport function getArchiveCompletionFinalClosureFinalizationSealBoundary() {\n  return archiveCompletionFinalClosureFinalizationSealBoundary;\n}\n`);

write(`frontend/app/api/${slug}/route.ts`, `import { NextResponse } from 'next/server';\nimport { getArchiveCompletionFinalClosureFinalizationSealBoundary } from '../../../lib/${store}';\n\nexport async function GET() {\n  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationSealBoundary());\n}\n`);

write(`frontend/app/${slug}/page.tsx`, `import { getArchiveCompletionFinalClosureFinalizationSealBoundary } from '../../lib/${store}';\n\nexport default function Page() {\n  const boundary = getArchiveCompletionFinalClosureFinalizationSealBoundary();\n  return (\n    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 79.0 Archive Completion Final Closure Finalization Seal Boundary</h1>\n      <p>Seal boundary remains closed and dry-run only.</p>\n      <ul>\n        <li>provider: {boundary.provider}</li>\n        <li>modelSelected: {boundary.modelSelected}</li>\n        <li>dryRunOnly: {String(boundary.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(boundary.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(boundary.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(boundary.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(boundary.providerDispatchAllowed)}</li>\n        <li>sealBoundaryClosed: {String(boundary.sealBoundaryClosed)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

write('scripts/v79-0.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE79_0.md', 'Phase 79.0'],\n  ['frontend/lib/${store}.ts', "phase: '79.0'"],\n  ['frontend/lib/${store}.ts', 'priorFinalReceiptClosed: true'],\n  ['frontend/lib/${store}.ts', 'sealBoundaryClosed: true'],\n  ['frontend/lib/${store}.ts', "provider: 'none'"],\n  ['frontend/lib/${store}.ts', "modelSelected: 'none'"],\n  ['frontend/lib/${store}.ts', 'dryRunOnly: true'],\n  ['frontend/lib/${store}.ts', 'finalDispatchBlocked: true'],\n  ['frontend/lib/${store}.ts', 'executionGateClosed: true'],\n  ['frontend/lib/${store}.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/${store}.ts', 'providerDispatchAllowed: false'],\n  ['frontend/app/api/${slug}/route.ts', 'NextResponse.json'],\n  ['frontend/app/${slug}/page.tsx', 'Phase 79.0']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (pkg.scripts['phase79:0:verify'] !== 'node scripts/v79-0.cjs') throw new Error('Missing script phase79:0:verify');\nconsole.log('Phase 79.0 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase79:0:verify'] = 'node scripts/v79-0.cjs';
writeJson('package.json', pkg);
console.log('Phase 79.0 patch applied.');

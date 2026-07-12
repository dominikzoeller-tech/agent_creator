const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const slug = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt';
const store = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-store';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + os.EOL, 'utf8');

write('README_PHASE77_0.md', `# Phase 77.0\n\nProvider Dispatch acknowledgement archive completion final closure finalization receipt.\n\nInvariants remain closed: provider=none, modelSelected=none, dryRunOnly=true, finalDispatchBlocked=true, executionGateClosed=true, networkCallAllowed=false, providerDispatchAllowed=false.\n`);

write(`frontend/lib/${store}.ts`, `export type ArchiveCompletionFinalClosureFinalizationReceipt = {\n  phase: '77.0';\n  receiptName: string;\n  priorFinalizationBoundaryClosed: true;\n  provider: 'none';\n  modelSelected: 'none';\n  dryRunOnly: true;\n  finalDispatchBlocked: true;\n  executionGateClosed: true;\n  networkCallAllowed: false;\n  providerDispatchAllowed: false;\n  humanApprovalTokenIssued: false;\n  humanApprovalTokenActivated: false;\n  humanApprovalTokenConsumed: false;\n  approvalCandidateApproved: false;\n  approvalCandidateExecuted: false;\n  promptPayloadPresent: false;\n  secretsPresent: false;\n  providerResponsePresent: false;\n};\n\nexport const archiveCompletionFinalClosureFinalizationReceipt: ArchiveCompletionFinalClosureFinalizationReceipt = {\n  phase: '77.0',\n  receiptName: 'archive-completion-final-closure-finalization-receipt',\n  priorFinalizationBoundaryClosed: true,\n  provider: 'none',\n  modelSelected: 'none',\n  dryRunOnly: true,\n  finalDispatchBlocked: true,\n  executionGateClosed: true,\n  networkCallAllowed: false,\n  providerDispatchAllowed: false,\n  humanApprovalTokenIssued: false,\n  humanApprovalTokenActivated: false,\n  humanApprovalTokenConsumed: false,\n  approvalCandidateApproved: false,\n  approvalCandidateExecuted: false,\n  promptPayloadPresent: false,\n  secretsPresent: false,\n  providerResponsePresent: false,\n};\n\nexport function getArchiveCompletionFinalClosureFinalizationReceipt() {\n  return archiveCompletionFinalClosureFinalizationReceipt;\n}\n`);

write(`frontend/app/api/${slug}/route.ts`, `import { NextResponse } from 'next/server';\nimport { getArchiveCompletionFinalClosureFinalizationReceipt } from '../../../lib/${store}';\n\nexport async function GET() {\n  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationReceipt());\n}\n`);

write(`frontend/app/${slug}/page.tsx`, `import { getArchiveCompletionFinalClosureFinalizationReceipt } from '../../lib/${store}';\n\nexport default function Page() {\n  const receipt = getArchiveCompletionFinalClosureFinalizationReceipt();\n  return (\n    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 77.0 Archive Completion Final Closure Finalization Receipt</h1>\n      <p>Receipt boundary remains closed and dry-run only.</p>\n      <ul>\n        <li>provider: {receipt.provider}</li>\n        <li>modelSelected: {receipt.modelSelected}</li>\n        <li>dryRunOnly: {String(receipt.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(receipt.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(receipt.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(receipt.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(receipt.providerDispatchAllowed)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

write('scripts/v77-0.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE77_0.md', 'Phase 77.0'],\n  ['frontend/lib/${store}.ts', "phase: '77.0'"],\n  ['frontend/lib/${store}.ts', "provider: 'none'"],\n  ['frontend/lib/${store}.ts', "modelSelected: 'none'"],\n  ['frontend/lib/${store}.ts', 'dryRunOnly: true'],\n  ['frontend/lib/${store}.ts', 'finalDispatchBlocked: true'],\n  ['frontend/lib/${store}.ts', 'executionGateClosed: true'],\n  ['frontend/lib/${store}.ts', 'networkCallAllowed: false'],\n  ['frontend/lib/${store}.ts', 'providerDispatchAllowed: false'],\n  ['frontend/app/api/${slug}/route.ts', 'NextResponse.json'],\n  ['frontend/app/${slug}/page.tsx', 'Phase 77.0']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (!pkg.scripts || pkg.scripts['phase77:0:verify'] !== 'node scripts/v77-0.cjs') throw new Error('Missing script phase77:0:verify');\nconsole.log('Phase 77.0 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase77:0:verify'] = 'node scripts/v77-0.cjs';
writeJson('package.json', pkg);
console.log('Phase 77.0 patch applied.');

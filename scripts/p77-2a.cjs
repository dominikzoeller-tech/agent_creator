const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const storeRel = 'frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-store.ts';
const storePath = path.join(root, storeRel);
if (!fs.existsSync(storePath)) throw new Error('Missing store: ' + storeRel);
let text = fs.readFileSync(storePath, 'utf8');
const oldLine = "export type ArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit = ReturnType<typeof getArchiveCompletionFinalClosureFinalizationReceipt> & {";
const newLine = "export type ArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit = Omit<ReturnType<typeof getArchiveCompletionFinalClosureFinalizationReceipt>, 'phase'> & {";
if (text.includes(oldLine)) {
  text = text.replace(oldLine, newLine);
} else if (!text.includes(newLine)) {
  throw new Error('Could not find expected type declaration in ' + storeRel);
}
fs.writeFileSync(storePath, text.replace(/
/g, os.EOL), 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase77:2a:verify'] = 'node scripts/v77-2a.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + os.EOL, 'utf8');
console.log('Phase 77.2a hotfix applied: fixed policy audit phase type conflict.');

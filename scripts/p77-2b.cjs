const fs = require('fs');
const path = require('path');
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
  throw new Error('Expected type line not found in ' + storeRel);
}
fs.writeFileSync(storePath, text, 'utf8');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase77:2b:verify'] = 'node scripts/v77-2b.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('Phase 77.2b hotfix applied.');

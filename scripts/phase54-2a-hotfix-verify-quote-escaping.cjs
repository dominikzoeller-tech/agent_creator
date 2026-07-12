
const fs = require('fs');
const path = require('path');
const root = process.cwd();

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\n'), 'utf8');
  console.log(`wrote ${relPath}`);
}
function readJson(relPath) { return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8')); }
function writeJson(relPath, value) { fs.writeFileSync(path.join(root, relPath), JSON.stringify(value, null, 2) + '\n', 'utf8'); console.log(`updated ${relPath}`); }
function addScript() {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['phase54:2a:verify'] = 'node scripts/phase54-2a-verify-quote-escaping.cjs';
  writeJson('package.json', pkg);
}

const verify = `const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx',
  'scripts/phase54-2-smoke-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard.cjs',
  'package.json',
];
const fragments = [
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', 'Phase 54.2 Dashboard'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', "audit.provider === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', "audit.modelSelected === 'none'"],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', 'audit.finalDispatchBlocked'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', 'audit.executionGateClosed'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', 'audit.networkCallAllowed === false'],
  ['frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard/page.tsx', 'audit.providerDispatchAllowed === false'],
  ['package.json', 'phase54:2:verify'],
  ['package.json', 'phase54:2:smoke'],
];
let failed = false;
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { console.error('MISSING ' + file); failed = true; }
  else console.log('OK ' + file);
}
for (const [file, fragment] of fragments) {
  const abs = path.join(root, file);
  const content = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  if (!content.includes(fragment)) { console.error('MISSING FRAGMENT ' + fragment + ' in ' + file); failed = true; }
  else console.log('OK fragment ' + fragment);
}
if (failed) process.exit(1);
console.log('Phase 54.2 verification OK.');
`;

writeFile('scripts/phase54-2-verify-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-receipt-policy-audit-dashboard-smoke.cjs', verify);
writeFile('scripts/phase54-2a-verify-quote-escaping.cjs', verify);
addScript();
console.log('Phase 54.2a hotfix applied. Next: npm run phase54:2a:verify && npm run phase54:2:verify && npm run build');

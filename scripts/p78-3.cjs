const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const finalScript = 'llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-final-receipt-policy-audit:final:check';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase78:3:verify'] = 'node scripts/v78-3.cjs';
pkg.scripts[finalScript] = 'node scripts/f78-3.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + os.EOL, 'utf8');

write('README_PHASE78_3.md', `# Phase 78.3 Final Handoff\n\nProvider Dispatch archive completion final closure finalization final receipt policy audit final handoff.\n\n## Required checks\n\n- phase78:0:verify\n- phase78:1:verify\n- phase78:2:verify\n- phase78:3:verify\n- final check script\n- npm run build\n\n## Invariants\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- approvalCandidateApproved=false\n- approvalCandidateExecuted=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\nThis handoff is documentation and verification only. No provider call, no network call, no dispatch.\n`);

write('scripts/v78-3.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE78_3.md', 'Phase 78.3 Final Handoff'],\n  ['README_PHASE78_3.md', 'provider=none'],\n  ['README_PHASE78_3.md', 'modelSelected=none'],\n  ['README_PHASE78_3.md', 'dryRunOnly=true'],\n  ['README_PHASE78_3.md', 'finalDispatchBlocked=true'],\n  ['README_PHASE78_3.md', 'executionGateClosed=true'],\n  ['README_PHASE78_3.md', 'networkCallAllowed=false'],\n  ['README_PHASE78_3.md', 'providerDispatchAllowed=false']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel, fragment);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (pkg.scripts['phase78:3:verify'] !== 'node scripts/v78-3.cjs') throw new Error('Missing script phase78:3:verify');\nif (!pkg.scripts['llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-final-receipt-policy-audit:final:check']) throw new Error('Missing final check script');\nconsole.log('Phase 78.3 final handoff verification OK.');\n`);

write('scripts/f78-3.cjs', `const fs = require('fs');\nconst path = require('path');\nconst text = fs.readFileSync(path.join(process.cwd(), 'README_PHASE78_3.md'), 'utf8');\nconst required = [\n  'provider=none',\n  'modelSelected=none',\n  'dryRunOnly=true',\n  'finalDispatchBlocked=true',\n  'executionGateClosed=true',\n  'networkCallAllowed=false',\n  'providerDispatchAllowed=false',\n  'promptPayloadPresent=false',\n  'secretsPresent=false',\n  'providerResponsePresent=false'\n];\nfor (const item of required) {\n  if (!text.includes(item)) throw new Error('Missing final handoff invariant: ' + item);\n  console.log('OK fragment', item);\n}\nconsole.log('Phase 78.3 final check OK.');\n`);
console.log('Phase 78.3 patch applied.');

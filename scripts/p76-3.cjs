const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, require('os').EOL), 'utf8');
  console.log('wrote', rel);
};

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + require('os').EOL, 'utf8');

const phaseName = 'Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement Completion Receipt Closure Finalization Archive Completion Final Closure Finalization Boundary Policy Audit';
const finalCheckScript = 'llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-boundary-policy-audit:final:check';

write('README_PHASE76_3.md', `# Phase 76.3 Final Handoff\n\n${phaseName}\n\n## Status\n\nFinal handoff prepared. This phase is documentation and verification only.\n\n## Required invariants\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- approvalCandidateApproved=false\n- approvalCandidateExecuted=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\n## Final check\n\nUse npm run phase76:3:verify and npm run ${finalCheckScript}.\n`);

write('scripts/v76-3.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE76_3.md', 'Phase 76.3 Final Handoff'],\n  ['README_PHASE76_3.md', 'provider=none'],\n  ['README_PHASE76_3.md', 'modelSelected=none'],\n  ['README_PHASE76_3.md', 'dryRunOnly=true'],\n  ['README_PHASE76_3.md', 'finalDispatchBlocked=true'],\n  ['README_PHASE76_3.md', 'executionGateClosed=true'],\n  ['README_PHASE76_3.md', 'networkCallAllowed=false'],\n  ['README_PHASE76_3.md', 'providerDispatchAllowed=false']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel, fragment);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (!pkg.scripts || pkg.scripts['phase76:3:verify'] !== 'node scripts/v76-3.cjs') throw new Error('Missing script phase76:3:verify');\nif (!pkg.scripts['${finalCheckScript}']) throw new Error('Missing final check script');\nconsole.log('Phase 76.3 final handoff verification OK.');\n`);

write('scripts/f76-3.cjs', `const fs = require('fs');\nconst path = require('path');\nconst text = fs.readFileSync(path.join(process.cwd(), 'README_PHASE76_3.md'), 'utf8');\nconst required = [\n  'provider=none',\n  'modelSelected=none',\n  'dryRunOnly=true',\n  'finalDispatchBlocked=true',\n  'executionGateClosed=true',\n  'networkCallAllowed=false',\n  'providerDispatchAllowed=false',\n  'promptPayloadPresent=false',\n  'secretsPresent=false',\n  'providerResponsePresent=false'\n];\nfor (const item of required) {\n  if (!text.includes(item)) throw new Error('Final check failed, missing: ' + item);\n  console.log('OK fragment', item);\n}\nconsole.log('Phase 76.3 final check OK.');\n`);

const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('package.json not found. Run from project root.');
const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase76:3:verify'] = 'node scripts/v76-3.cjs';
pkg.scripts[finalCheckScript] = 'node scripts/f76-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 76.3 patch applied. Short script files: scripts/v76-3.cjs and scripts/f76-3.cjs');

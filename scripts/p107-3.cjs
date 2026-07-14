const fs = require('fs');
const path = require('path');
const root = process.cwd();
const w = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

w('README_PHASE107_3.md', "# Phase 107.3 Final Handoff\n\nFinal handoff for Phase 107.\n\nCompleted short-name chain:\n\n- Phase 107.0 boundary: /p107-0 and /api/p107-0\n- Phase 107.1 policy audit: /p107-1 and /api/p107-1\n- Phase 107.2 dashboard: /p107-2-dash\n\nSecurity posture remains locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- approvalCandidateApproved=false\n- approvalCandidateExecuted=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n- externalDataTransferAllowed=false\n- policyDecision=blocked-dry-run-only\n\nNext phase: Phase 108.0.\n\nCommunication rule: keep updates short, direct, practical. Use short ZIP, script, route, API and store names.\n");
w('scripts/f107-3.cjs', "const fs = require('fs');\nconst checks = [\n  ['README_PHASE107_3.md', 'Phase 107.3 Final Handoff'],\n  ['README_PHASE107_3.md', '/p107-0'],\n  ['README_PHASE107_3.md', '/p107-1'],\n  ['README_PHASE107_3.md', '/p107-2-dash'],\n  ['README_PHASE107_3.md', 'provider=none'],\n  ['README_PHASE107_3.md', 'modelSelected=none'],\n  ['README_PHASE107_3.md', 'dryRunOnly=true'],\n  ['README_PHASE107_3.md', 'networkCallAllowed=false'],\n  ['README_PHASE107_3.md', 'providerDispatchAllowed=false'],\n  ['README_PHASE107_3.md', 'externalDataTransferAllowed=false'],\n  ['README_PHASE107_3.md', 'policyDecision=blocked-dry-run-only'],\n  ['README_PHASE107_3.md', 'Phase 108.0'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 107.3 final check OK.');\n");
w('scripts/v107-3.cjs', "const fs = require('fs');\nconst checks = [\n  ['README_PHASE107_3.md', 'Phase 107.3 Final Handoff'],\n  ['scripts/f107-3.cjs', 'Phase 107.3 final check OK'],\n  ['package.json', 'phase107:3:verify'],\n  ['package.json', 'llm:p107:final:check'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 107.3 verification OK.');\n");

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase107:3:verify'] = 'node scripts/v107-3.cjs';
pkg.scripts['llm:p107:final:check'] = 'node scripts/f107-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 107.3 patch applied.');

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

w('README_PHASE97_3.md', `# Phase 97.3 Final Handoff\n\nFinal handoff for Phase 97.\n\nCompleted chain:\n\n- Phase 97.0 receipt: /p97-0 and /api/p97-0\n- Phase 97.1 policy audit: /p97-1 and /api/p97-1\n- Phase 97.2 dashboard: /p97-2-dash\n\nSecurity posture remains locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\nNext phase: Phase 98.0.\n\nCommunication rule: keep updates short, direct, practical. Use short ZIP, script, route, API and store names.\n`);

w('scripts/f97-3.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE97_3.md', 'Phase 97.3 Final Handoff'],\n  ['README_PHASE97_3.md', '/p97-0'],\n  ['README_PHASE97_3.md', '/p97-1'],\n  ['README_PHASE97_3.md', '/p97-2-dash'],\n  ['README_PHASE97_3.md', 'provider=none'],\n  ['README_PHASE97_3.md', 'modelSelected=none'],\n  ['README_PHASE97_3.md', 'dryRunOnly=true'],\n  ['README_PHASE97_3.md', 'networkCallAllowed=false'],\n  ['README_PHASE97_3.md', 'providerDispatchAllowed=false'],\n  ['README_PHASE97_3.md', 'Phase 98.0'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 97.3 final check OK.');\n`);

w('scripts/v97-3.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE97_3.md', 'Phase 97.3 Final Handoff'],\n  ['scripts/f97-3.cjs', 'Phase 97.3 final check OK'],\n  ['package.json', 'phase97:3:verify'],\n  ['package.json', 'llm:p97:final:check'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 97.3 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase97:3:verify'] = 'node scripts/v97-3.cjs';
pkg.scripts['llm:p97:final:check'] = 'node scripts/f97-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 97.3 patch applied.');

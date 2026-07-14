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

w('README_PHASE91_3.md', `# Phase 91.3 - Final Handoff\n\nFinal handoff for Phase 91: Seal Final Closure Receipt Completion Final Closure Receipt Policy Audit Dashboard.\n\nShort names used:\n\n- Receipt UI: /p91-0\n- Receipt API: /api/p91-0\n- Policy audit UI: /p91-1\n- Policy audit API: /api/p91-1\n- Dashboard UI: /p91-2-dash\n- Scripts: p91-*.cjs / v91-*.cjs / s91-*.cjs / f91-3.cjs\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\nNext phase: Phase 92.0. Continue with short route/API/store names only.\n`);

w('scripts/v91-3.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE91_3.md', 'Phase 91.3'],\n  ['README_PHASE91_3.md', '/p91-0'],\n  ['README_PHASE91_3.md', '/api/p91-0'],\n  ['README_PHASE91_3.md', '/p91-1'],\n  ['README_PHASE91_3.md', '/api/p91-1'],\n  ['README_PHASE91_3.md', '/p91-2-dash'],\n  ['README_PHASE91_3.md', 'provider=none'],\n  ['README_PHASE91_3.md', 'modelSelected=none'],\n  ['README_PHASE91_3.md', 'dryRunOnly=true'],\n  ['README_PHASE91_3.md', 'networkCallAllowed=false'],\n  ['scripts/f91-3.cjs', 'Phase 91 final check OK'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 91.3 verification OK.');\n`);

w('scripts/f91-3.cjs', `const fs = require('fs');\nconst required = [\n  'README_PHASE91_3.md',\n  'frontend/app/p91-0/page.tsx',\n  'frontend/app/api/p91-0/route.ts',\n  'frontend/app/p91-1/page.tsx',\n  'frontend/app/api/p91-1/route.ts',\n  'frontend/app/p91-2-dash/page.tsx',\n];\nfor (const file of required) {\n  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);\n}\nconsole.log('Phase 91 final check OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase91:3:verify'] = 'node scripts/v91-3.cjs';
pkg.scripts['llm:p91:final:check'] = 'node scripts/f91-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 91.3 patch applied.');

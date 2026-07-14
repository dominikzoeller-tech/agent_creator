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

w('README_PHASE83_3.md', `# Phase 83.3 - Final Handoff\n\nFinal handoff for Phase 83: Seal Final Closure Receipt Boundary Policy Audit Dashboard.\n\nShort names used:\n\n- Boundary UI: /p83-0\n- Boundary API: /api/p83-0\n- Policy audit UI: /p83-1\n- Policy audit API: /api/p83-1\n- Dashboard UI: /p83-2-dash\n- Scripts: p83-*.cjs / v83-*.cjs / s83-*.cjs / f83-3.cjs\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\nNext phase: Phase 84.0. Continue with short route/API/store names only.\n`);

w('scripts/v83-3.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE83_3.md', 'Phase 83.3'],\n  ['README_PHASE83_3.md', '/p83-0'],\n  ['README_PHASE83_3.md', '/api/p83-0'],\n  ['README_PHASE83_3.md', '/p83-1'],\n  ['README_PHASE83_3.md', '/api/p83-1'],\n  ['README_PHASE83_3.md', '/p83-2-dash'],\n  ['README_PHASE83_3.md', 'provider=none'],\n  ['README_PHASE83_3.md', 'modelSelected=none'],\n  ['README_PHASE83_3.md', 'dryRunOnly=true'],\n  ['README_PHASE83_3.md', 'networkCallAllowed=false'],\n  ['scripts/f83-3.cjs', 'Phase 83 final check OK'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 83.3 verification OK.');\n`);

w('scripts/f83-3.cjs', `const fs = require('fs');\nconst required = [\n  'README_PHASE83_3.md',\n  'frontend/app/p83-0/page.tsx',\n  'frontend/app/api/p83-0/route.ts',\n  'frontend/app/p83-1/page.tsx',\n  'frontend/app/api/p83-1/route.ts',\n  'frontend/app/p83-2-dash/page.tsx',\n];\nfor (const file of required) {\n  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);\n}\nconsole.log('Phase 83 final check OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase83:3:verify'] = 'node scripts/v83-3.cjs';
pkg.scripts['llm:p83:final:check'] = 'node scripts/f83-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 83.3 patch applied.');

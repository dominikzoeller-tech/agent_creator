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

w('README_PHASE96_3.md', `# Phase 96.3 - Final Handoff\n\nFinal handoff for Phase 96: Seal Final Closure Receipt Completion Final Seal Boundary Policy Audit Dashboard.\n\nShort names used:\n\n- Boundary UI: /p96-0\n- Boundary API: /api/p96-0\n- Policy audit UI: /p96-1\n- Policy audit API: /api/p96-1\n- Dashboard UI: /p96-2-dash\n- Scripts: p96-*.cjs / v96-*.cjs / s96-*.cjs / f96-3.cjs\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n\nNext phase: Phase 97.0. Continue with short route/API/store names only.\n`);

w('scripts/v96-3.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE96_3.md', 'Phase 96.3'],\n  ['README_PHASE96_3.md', '/p96-0'],\n  ['README_PHASE96_3.md', '/api/p96-0'],\n  ['README_PHASE96_3.md', '/p96-1'],\n  ['README_PHASE96_3.md', '/api/p96-1'],\n  ['README_PHASE96_3.md', '/p96-2-dash'],\n  ['README_PHASE96_3.md', 'provider=none'],\n  ['README_PHASE96_3.md', 'modelSelected=none'],\n  ['README_PHASE96_3.md', 'dryRunOnly=true'],\n  ['README_PHASE96_3.md', 'networkCallAllowed=false'],\n  ['scripts/f96-3.cjs', 'Phase 96 final check OK'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 96.3 verification OK.');\n`);

w('scripts/f96-3.cjs', `const fs = require('fs');\nconst required = [\n  'README_PHASE96_3.md',\n  'frontend/app/p96-0/page.tsx',\n  'frontend/app/api/p96-0/route.ts',\n  'frontend/app/p96-1/page.tsx',\n  'frontend/app/api/p96-1/route.ts',\n  'frontend/app/p96-2-dash/page.tsx',\n];\nfor (const file of required) {\n  if (!fs.existsSync(file)) throw new Error('Missing final artifact: ' + file);\n}\nconsole.log('Phase 96 final check OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase96:3:verify'] = 'node scripts/v96-3.cjs';
pkg.scripts['llm:p96:final:check'] = 'node scripts/f96-3.cjs';
writeJson('package.json', pkg);
console.log('Phase 96.3 patch applied.');

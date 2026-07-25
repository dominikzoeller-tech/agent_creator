const fs = require('fs');
const path = require('path');
const root = process.cwd();
const must = [
  'frontend/lib/cmt-secure-master-agent-mvp.ts',
  'frontend/app/cmt/master/secure/agent/page.tsx',
  'scripts/mvp-agent-1.cjs',
  'scripts/v-mvp-agent-1.cjs',
];
let ok = true;
for (const rel of must) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error('[missing]', rel);
    ok = false;
  } else {
    console.log('[ok]', rel);
  }
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const key of ['mvp:verify', 'agent:mvp:verify']) {
  if (!pkg.scripts || !pkg.scripts[key]) {
    console.error('[missing script]', key);
    ok = false;
  } else {
    console.log('[ok script]', key, '=>', pkg.scripts[key]);
  }
}
const page = fs.readFileSync(path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx'), 'utf8');
for (const token of ['Zentrale Agent-Arbeitsseite', 'Lokal prüfen', '5er-Gremium', 'keine externe Weitergabe']) {
  if (!page.includes(token)) {
    console.error('[missing token]', token);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log('[OK] mvp agent verify passed');

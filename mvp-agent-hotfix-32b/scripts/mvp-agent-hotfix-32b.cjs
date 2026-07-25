const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}
function ensureFile(rel, content) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) write(rel, content);
  else console.log('[exists]', rel);
}
function ensureImport(page, importLine) {
  if (page.includes(importLine)) return page;
  const lines = page.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  return lines.join('\n');
}
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}

ensureFile('frontend/lib/cmt-secure-master-work-state.ts', `export type SecureMasterWorkState = {
  localWorkReady: true;
  liveReady: false;
  providerAdapterNext: true;
  currentMainPage: '/cmt/master/secure/agent';
  userInstruction: string;
  nextThreshold: string;
  blockedLiveReasons: string[];
  safeNow: string[];
};

export const secureMasterWorkState: SecureMasterWorkState = {
  localWorkReady: true,
  liveReady: false,
  providerAdapterNext: true,
  currentMainPage: '/cmt/master/secure/agent',
  userInstruction: 'Jetzt lokal mit echten Fragen testen. Noch keine API-Keys eingeben und keine Live-KI aktivieren.',
  nextThreshold: 'Naechste Schwelle: kontrollierten Live-Test nur mit serverseitigem ENV-Key und expliziter Freigabe vorbereiten.',
  blockedLiveReasons: [
    'Provider ist noch nicht aktiv',
    'Live-Modell ist noch nicht aktiv',
    'keine externe Datenschutzfreigabe aktiv',
    'echte Secrets duerfen nicht im Client liegen',
    'Live-Test-Freigabe fehlt noch',
  ],
  safeNow: [
    'lokal fragen',
    'Gremium lokal auswerten',
    'Privacy-Gate testen',
    'Provider-Dry-Run simulieren',
    'Adapter-Dry-Run simulieren',
    'Server-Dry-Run testen',
    'Audit-Verlauf lokal pruefen',
    'Logs lokal exportieren',
  ],
};
`);

let page = fs.readFileSync(pagePath, 'utf8');
page = ensureImport(page, "import { secureMasterWorkState } from '../../../../../lib/cmt-secure-master-work-state';");
fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write]', pageRel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const pagePath=path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx');const page=fs.readFileSync(pagePath,'utf8');for(const token of ['secureMasterWorkState','cmt-secure-master-work-state','Arbeitsstatus']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}const lib=path.join(root,'frontend/lib/cmt-secure-master-work-state.ts');if(!fs.existsSync(lib)){console.error('[missing file] frontend/lib/cmt-secure-master-work-state.ts');ok=false}else console.log('[ok file] frontend/lib/cmt-secure-master-work-state.ts');if(ok)console.log('[OK] hotfix32b verify passed');process.exit(ok?0:1);`;
write('scripts/v-hotfix-32b.cjs', verify);
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['hotfix32b:verify'] = 'node scripts/v-hotfix-32b.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[OK] hotfix32b applied');

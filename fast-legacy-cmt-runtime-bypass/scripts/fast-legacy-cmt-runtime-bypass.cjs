const fs = require('fs');
const path = require('path');
const root = process.cwd();

function ensureDirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function write(file, text) {
  ensureDirFor(file);
  fs.writeFileSync(file, text.endsWith('\n') ? text : text + '\n', 'utf8');
}

function hasExport(text, name) {
  return new RegExp(`export\\s+(?:async\\s+)?(?:function|const|let|var|class)\\s+${name}\\b`).test(text) ||
    new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(text);
}

function appendIfMissing(rel, marker, block) {
  const file = path.join(root, rel);
  let text = read(file);
  if (!text.trim()) {
    text = `/* Legacy compatibility module created by fast-legacy-cmt-runtime-bypass. */\n`;
  }
  if (!text.includes(marker)) {
    text += `\n\n${block}\n`;
    write(file, text);
    console.log('[patch]', rel);
  } else {
    console.log('[ok]', rel);
  }
}

const askSecureMasterCommitteeBlock = `// Legacy runtime compatibility export.
export async function askSecureMasterCommittee(input: any = {}, options: any = {}): Promise<any> {
  const prompt = typeof input === 'string' ? input : String(input?.prompt ?? input?.question ?? input?.input ?? '');
  const committeeRoles = [
    { id: 'chair', name: 'Vorsitz / Synthese', focus: 'Zusammenfassung und Entscheidung' },
    { id: 'privacy', name: 'Datenschutz / Privacy', focus: 'Lokale Verarbeitung und Anonymisierung' },
    { id: 'tech', name: 'Technik / Architektur', focus: 'Machbarkeit und Systemgrenzen' },
    { id: 'risk', name: 'Risiko / Sicherheit', focus: 'Risiken und Schutzmassnahmen' },
    { id: 'quality', name: 'Qualitaet / Entscheidung', focus: 'Klarheit und naechster Schritt' },
  ];
  return {
    ok: true,
    stub: true,
    phase: 'legacy-runtime-compat',
    prompt,
    input,
    options,
    committeeRoles,
    answer: 'Legacy-Kompatibilitaetsantwort: lokal bleiben, sensible Inhalte schuetzen und externe Verarbeitung nur nach Freigabe zulassen.',
    finalRecommendation: 'Lokal verarbeiten und externe Weitergabe blockieren, bis eine explizite Freigabe vorliegt.',
    privacyDecision: 'local_only',
    localOnly: true,
    externalSharingAllowed: false,
    providerDispatchAllowed: false,
    networkCallAllowed: false,
    finalDispatchBlocked: true,
    createdAt: new Date().toISOString(),
  };
}`;

const createCommitteeAskStateBlock = `// Legacy runtime compatibility export.
export function createCommitteeAskState(input: any = {}, options: any = {}): any {
  const prompt = typeof input === 'string' ? input : String(input?.prompt ?? input?.question ?? input?.input ?? '');
  return {
    ok: true,
    stub: true,
    phase: 'committee-ask-state-compat',
    prompt,
    input,
    options,
    status: 'ready',
    state: 'ready',
    localOnly: true,
    externalSharingAllowed: false,
    providerDispatchAllowed: false,
    networkCallAllowed: false,
    finalDispatchBlocked: true,
    selectedOption: 'local_only',
    committee: {
      enabled: true,
      roles: ['chair', 'privacy', 'tech', 'risk', 'quality'],
    },
    createdAt: new Date().toISOString(),
  };
}`;

for (const rel of [
  'frontend/lib/cmt-master-committee.ts',
  'frontend/app/lib/cmt-master-committee.ts',
]) {
  const file = path.join(root, rel);
  let text = read(file);
  if (!text.trim()) text = '/* Legacy committee compatibility module. */\n';
  if (!hasExport(text, 'askSecureMasterCommittee')) {
    text += `\n\n${askSecureMasterCommitteeBlock}\n`;
    write(file, text);
    console.log('[export]', rel, 'askSecureMasterCommittee');
  } else {
    console.log('[ok export]', rel, 'askSecureMasterCommittee');
  }
}

for (const rel of [
  'frontend/lib/cmt-ask.ts',
  'frontend/app/lib/cmt-ask.ts',
]) {
  const file = path.join(root, rel);
  let text = read(file);
  if (!text.trim()) text = '/* Legacy ask compatibility module. */\n';
  if (!hasExport(text, 'createCommitteeAskState')) {
    text += `\n\n${createCommitteeAskStateBlock}\n`;
    write(file, text);
    console.log('[export]', rel, 'createCommitteeAskState');
  } else {
    console.log('[ok export]', rel, 'createCommitteeAskState');
  }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name === 'page.tsx' || name === 'page.ts') out.push(full);
  }
  return out;
}

function isClientComponent(text) {
  const start = text.trimStart();
  return start.startsWith("'use client'") || start.startsWith('"use client"');
}

function insertRouteConfig(text) {
  if (text.includes("export const dynamic = 'force-dynamic'") || text.includes('export const dynamic = "force-dynamic"')) return text;
  const routeConfig = "export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n";
  const lines = text.split(/\r?\n/);
  let insertAt = 0;

  // Keep top directives first.
  while (insertAt < lines.length && /^\s*['\"][^'\"]+['\"]\s*;?\s*$/.test(lines[insertAt])) insertAt++;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;

  // Keep import block first.
  while (insertAt < lines.length && (lines[insertAt].startsWith('import ') || lines[insertAt].trim() === '')) insertAt++;

  lines.splice(insertAt, 0, '', routeConfig.trim(), '');
  return lines.join('\n');
}

let dynamicChanged = 0;
const appRoot = path.join(root, 'frontend/app/cmt');
for (const file of walk(appRoot)) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  let text = read(file);
  if (isClientComponent(text)) {
    console.log('[skip client]', rel);
    continue;
  }
  const before = text;
  text = insertRouteConfig(text);
  if (text !== before) {
    write(file, text);
    console.log('[dynamic]', rel);
    dynamicChanged++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;function read(rel){const f=path.join(root,rel);return fs.existsSync(f)?fs.readFileSync(f,'utf8'):''}function hasExport(text,name){return new RegExp('export\\\\s+(?:async\\\\s+)?(?:function|const|let|var|class)\\\\s+'+name+'\\\\b').test(text)||new RegExp('export\\\\s*\\\\{[^}]*\\\\b'+name+'\\\\b[^}]*\\\\}').test(text)}for(const rel of ['frontend/lib/cmt-master-committee.ts','frontend/app/lib/cmt-master-committee.ts']){const text=read(rel);if(!hasExport(text,'askSecureMasterCommittee')){console.error('[missing export]',rel,'askSecureMasterCommittee');ok=false}else console.log('[ok export]',rel,'askSecureMasterCommittee')}for(const rel of ['frontend/lib/cmt-ask.ts','frontend/app/lib/cmt-ask.ts']){const text=read(rel);if(!hasExport(text,'createCommitteeAskState')){console.error('[missing export]',rel,'createCommitteeAskState');ok=false}else console.log('[ok export]',rel,'createCommitteeAskState')}if(ok)console.log('[OK] fast legacy runtime bypass verify passed');process.exit(ok?0:1);`;
write(path.join(root, 'scripts/v-fast-legacy-cmt-runtime-bypass.cjs'), verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(read(pkgPath));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fastlegacyruntime:verify'] = 'node scripts/v-fast-legacy-cmt-runtime-bypass.cjs';
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('[write] package.json script fastlegacyruntime:verify');
console.log('[OK] fast legacy runtime bypass applied, dynamicChanged=' + dynamicChanged);

const fs = require('fs');
const path = require('path');
const root = process.cwd();

const files = [
  'frontend/app/lib/cmt-master-committee.ts',
  'frontend/lib/cmt-master-committee.ts',
];

const typeBlock = `
export type SecureMasterCommitteeRole = {
  id: string;
  name: string;
  focus: string;
  recommendation?: string;
};

export type SecureMasterCommitteeResult = {
  ok: boolean;
  stub?: boolean;
  phase?: string;
  status?: string;
  committeeRoles: SecureMasterCommitteeRole[];
  finalRecommendation: string;
  privacyDecision?: string;
  localOnly?: boolean;
  createdAt: string;
  summary?: string;
};
`;

const valueBlock = `
const defaultCommitteeRoles: SecureMasterCommitteeRole[] = [
  { id: 'chair', name: 'Vorsitz / Synthese', focus: 'Zusammenfuehrung der Empfehlungen' },
  { id: 'privacy', name: 'Datenschutz / Privacy', focus: 'Lokale Verarbeitung und Anonymisierung' },
  { id: 'tech', name: 'Technik / Architektur', focus: 'Machbarkeit und Systemgrenzen' },
  { id: 'risk', name: 'Risiko / Sicherheit', focus: 'Kontrollpunkte und Missbrauchsschutz' },
  { id: 'quality', name: 'Qualitaet / Entscheidung', focus: 'Klarheit und finale Empfehlung' },
];

export function getSecureMasterCommitteeDemo(): SecureMasterCommitteeResult {
  return {
    ok: true,
    stub: true,
    phase: 'legacy-committee-compat',
    status: 'stubbed',
    committeeRoles: defaultCommitteeRoles,
    finalRecommendation: 'Lokal bleiben, sensible Inhalte schuetzen und externe Verarbeitung nur nach expliziter Freigabe zulassen.',
    privacyDecision: 'local_only',
    localOnly: true,
    createdAt: new Date().toISOString(),
    summary: 'Secure Master Committee compatibility demo is available.',
  };
}

export const getSecureMasterCommittee = getSecureMasterCommitteeDemo;
export const createSecureMasterCommittee = getSecureMasterCommitteeDemo;
export const getSecureMasterCommitteeStatus = getSecureMasterCommitteeDemo;
`;

function ensureMakeCompat(text) {
  if (text.includes('makeCompatStub')) return text;
  return `export function makeCompatStub(name: string): any { return { ok: true, stub: true, name, status: 'stubbed', items: [], data: [] }; }\n` + text;
}

let changed = 0;
for (const rel of files) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  let text = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  const before = text;
  text = ensureMakeCompat(text);

  if (!/export\s+type\s+SecureMasterCommitteeResult\b/.test(text)) {
    text += typeBlock;
  }

  if (!/export\s+function\s+getSecureMasterCommitteeDemo\b/.test(text) && !/export\s+const\s+getSecureMasterCommitteeDemo\b/.test(text)) {
    text += valueBlock;
  }

  if (!/export\s+(const|function)\s+getSecureMasterCommittee\b/.test(text)) {
    text += `\nexport const getSecureMasterCommittee: any = getSecureMasterCommitteeDemo;\n`;
  }
  if (!/export\s+(const|function)\s+createSecureMasterCommittee\b/.test(text)) {
    text += `\nexport const createSecureMasterCommittee: any = getSecureMasterCommitteeDemo;\n`;
  }

  if (!/export\s+default\s+/.test(text)) {
    text += `\nexport default getSecureMasterCommitteeDemo;\n`;
  }

  if (text !== before) {
    fs.writeFileSync(full, text.endsWith('\n') ? text : text + '\n', 'utf8');
    console.log('[fix]', rel);
    changed++;
  } else {
    console.log('[ok]', rel);
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/app/lib/cmt-master-committee.ts','frontend/lib/cmt-master-committee.ts']){const full=path.join(root,rel);if(!fs.existsSync(full)){console.error('[missing]',rel);ok=false;continue}const text=fs.readFileSync(full,'utf8');for(const token of ['export type SecureMasterCommitteeResult','getSecureMasterCommitteeDemo','getSecureMasterCommittee','createSecureMasterCommittee']){if(!text.includes(token)){console.error('[missing token]',rel,token);ok=false}else console.log('[ok token]',rel,token)}}if(ok)console.log('[OK] committee result type export verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-committee-result-type-export.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixcommitteetype:verify'] = 'node scripts/v-fix-committee-result-type-export.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixcommitteetype:verify');
console.log('[OK] committee result type export fix applied, changed=' + changed);

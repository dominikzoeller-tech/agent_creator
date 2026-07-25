const fs = require('fs');
const path = require('path');
const root = process.cwd();

function ensureImportSymbol(importLine, symbol) {
  if (importLine.includes(symbol)) return importLine;
  return importLine.replace(/import\s+\{/, 'import { ' + symbol + ',');
}

const libRel = 'frontend/lib/cmt-secure-master-provider-audit-envelope.ts';
const libPath = path.join(root, libRel);
if (!fs.existsSync(libPath)) {
  fs.mkdirSync(path.dirname(libPath), { recursive: true });
  fs.writeFileSync(libPath, '', 'utf8');
}
let lib = fs.readFileSync(libPath, 'utf8');
if (!lib.includes('SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY')) {
  lib = "export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY = 'secure_master_provider_audit_history';\n" + lib;
  fs.writeFileSync(libPath, lib, 'utf8');
  console.log('[patch]', libRel);
} else {
  console.log('[ok]', libRel);
}

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

const targetSource = '../../../../../lib/cmt-secure-master-provider-audit-envelope';
const re = new RegExp("import\\s+\\{([^}]*)\\}\\s+from\\s+['\"]" + targetSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"];?");
const match = page.match(re);
if (match) {
  const original = match[0];
  let replacement = original;
  if (!replacement.includes('SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY')) {
    replacement = replacement.replace(/import\s+\{/, 'import { SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY,');
    page = page.replace(original, replacement);
    fs.writeFileSync(pagePath, page, 'utf8');
    console.log('[patch]', pageRel);
  } else {
    console.log('[ok]', pageRel);
  }
} else {
  const importLine = "import { SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, createSecureMasterProviderAuditEnvelope, type SecureMasterProviderAuditHistoryItem } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';";
  const lines = page.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) lastImport = i;
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  page = lines.join('\n');
  fs.writeFileSync(pagePath, page, 'utf8');
  console.log('[insert]', pageRel);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const lib='frontend/lib/cmt-secure-master-provider-audit-envelope.ts';const page='frontend/app/cmt/master/secure/agent/page.tsx';for(const rel of [lib,page]){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const libText=fs.readFileSync(path.join(root,lib),'utf8');if(!libText.includes('export const SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY')){console.error('[missing export] SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY');ok=false}else console.log('[ok export] SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY');const pageText=fs.readFileSync(path.join(root,page),'utf8');if(!pageText.includes('SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY')){console.error('[missing page token] SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY');ok=false}else console.log('[ok page token] SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY');if(ok)console.log('[OK] provider audit history key verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-provider-audit-history-key.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixauditkey:verify'] = 'node scripts/v-fix-provider-audit-history-key.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixauditkey:verify');
console.log('[OK] provider audit history key fix applied');

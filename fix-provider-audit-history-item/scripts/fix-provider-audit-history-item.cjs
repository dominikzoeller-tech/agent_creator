const fs = require('fs');
const path = require('path');
const root = process.cwd();

const libRel = 'frontend/lib/cmt-secure-master-provider-audit-envelope.ts';
const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const libPath = path.join(root, libRel);
const pagePath = path.join(root, pageRel);

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

if (!fs.existsSync(libPath)) {
  console.error('[missing]', libRel);
  process.exit(1);
}
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}

let lib = fs.readFileSync(libPath, 'utf8');

if (!lib.includes('createProviderAuditHistoryItem')) {
  lib += `
export function createProviderAuditHistoryItem(envelope: SecureMasterProviderAuditEnvelope): SecureMasterProviderAuditHistoryItem {
  return {
    ...envelope,
    id: envelope.id || 'provider_audit_' + Date.now(),
    createdAt: envelope.createdAt || new Date().toISOString(),
  };
}
`;
  fs.writeFileSync(libPath, lib, 'utf8');
  console.log('[patch]', libRel);
} else {
  console.log('[ok]', libRel);
}

let page = fs.readFileSync(pagePath, 'utf8');
const source = '../../../../../lib/cmt-secure-master-provider-audit-envelope';
const importRegex = new RegExp("import\\s+\\{([^}]*)\\}\\s+from\\s+['\"]" + source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"];?");
const match = page.match(importRegex);

if (match) {
  const original = match[0];
  if (!original.includes('createProviderAuditHistoryItem')) {
    const replacement = original.replace(/import\s+\{/, 'import { createProviderAuditHistoryItem,');
    page = page.replace(original, replacement);
    fs.writeFileSync(pagePath, page, 'utf8');
    console.log('[patch]', pageRel);
  } else {
    console.log('[ok]', pageRel);
  }
} else {
  const importLine = "import { createProviderAuditHistoryItem, SECURE_MASTER_PROVIDER_AUDIT_HISTORY_KEY, createSecureMasterProviderAuditEnvelope, type SecureMasterProviderAuditHistoryItem } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';";
  const lines = page.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  fs.writeFileSync(pagePath, lines.join('\n'), 'utf8');
  console.log('[insert]', pageRel);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;const lib='frontend/lib/cmt-secure-master-provider-audit-envelope.ts';const page='frontend/app/cmt/master/secure/agent/page.tsx';for(const rel of [lib,page]){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const libText=fs.readFileSync(path.join(root,lib),'utf8');if(!libText.includes('export function createProviderAuditHistoryItem')){console.error('[missing export] createProviderAuditHistoryItem');ok=false}else console.log('[ok export] createProviderAuditHistoryItem');const pageText=fs.readFileSync(path.join(root,page),'utf8');if(!pageText.includes('createProviderAuditHistoryItem')){console.error('[missing page token] createProviderAuditHistoryItem');ok=false}else console.log('[ok page token] createProviderAuditHistoryItem');if(ok)console.log('[OK] provider audit history item verify passed');process.exit(ok?0:1);`;
ensureDir(path.join(root, 'scripts/v-fix-provider-audit-history-item.cjs'));
fs.writeFileSync(path.join(root, 'scripts/v-fix-provider-audit-history-item.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixaudititem:verify'] = 'node scripts/v-fix-provider-audit-history-item.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixaudititem:verify');
console.log('[OK] provider audit history item fix applied');

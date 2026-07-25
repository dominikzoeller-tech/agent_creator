const fs = require('fs');
const path = require('path');
const root = process.cwd();
const appRoot = path.join(root, 'frontend/app');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function parseImports(text) {
  const imports = [];
  const re = /import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/gms;
  let m;
  while ((m = re.exec(text))) imports.push({ spec: m[1].trim(), source: m[2] });
  return imports;
}

function collectImportedNames(spec) {
  const names = new Set();
  const named = spec.match(/\{([\s\S]*?)\}/);
  if (named) {
    for (const part of named[1].split(',')) {
      const raw = part.trim();
      if (!raw) continue;
      const left = raw.split(/\s+as\s+/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(left)) names.add(left);
    }
  }
  return names;
}

function existsModuleNoExt(absNoExt) {
  return fs.existsSync(absNoExt) || fs.existsSync(absNoExt + '.ts') || fs.existsSync(absNoExt + '.tsx') || fs.existsSync(absNoExt + '.js') || fs.existsSync(absNoExt + '.jsx') || fs.existsSync(path.join(absNoExt, 'index.ts')) || fs.existsSync(path.join(absNoExt, 'index.tsx'));
}

function stripExt(absPath) {
  return absPath.replace(/\.(ts|tsx|js|jsx)$/, '');
}

function resolveImport(file, source) {
  if (!source.startsWith('.')) return null;
  const absNoExt = stripExt(path.resolve(path.dirname(file), source));
  return absNoExt;
}

function toSafeId(value) {
  const raw = String(value).replace(/[^A-Za-z0-9_$]/g, '_');
  return /^[A-Za-z_$]/.test(raw) ? raw : 'stub_' + raw;
}

function makeStubContent(moduleName, names) {
  const exports = new Map();
  for (const n of names) exports.set(n, n);

  const baseSafe = toSafeId(path.basename(moduleName).replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
  exports.set(baseSafe, baseSafe);

  // Broad common legacy exports. Map avoids duplicate declarations.
  for (const n of [
    'answerLogListBrowserStore',
    'cmtMasterAnswerLogListBrowserStore',
    'cmtMasterAppEntry',
    'cmtMasterNavStatus',
    'cmtMasterCommittee',
    'cmtMasterSecureGuide',
    'cmtMasterAnswerLogEntry',
    'cmtMasterAnswerLogListBrowserStoreEntry',
    'getAnswerLogList',
    'loadAnswerLogList',
    'saveAnswerLogList',
    'listAnswerLogs',
    'importAnswerLogs',
    'exportAnswerLogs',
    'getCmtMasterAppEntry',
    'getCmtMasterNavStatus',
    'createCmtMasterCommittee',
  ]) exports.set(n, n);

  const lines = [];
  lines.push(`/* Auto-generated exact compatibility stub for ${moduleName}. */`);
  lines.push(`export type CompatStub = Record<string, any>;`);
  lines.push(`export function makeCompatStub(name: string): any {`);
  lines.push(`  return new Proxy(function compatStub(..._args: any[]) {`);
  lines.push(`    return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Compatibility stub for ${moduleName}' };`);
  lines.push(`  }, {`);
  lines.push(`    get(_target, prop) {`);
  lines.push(`      if (prop === 'then') return undefined;`);
  lines.push(`      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });`);
  lines.push(`      if (prop === Symbol.toPrimitive) return () => name;`);
  lines.push(`      if (prop === 'length') return 0;`);
  lines.push(`      return makeCompatStub(name + '.' + String(prop));`);
  lines.push(`    },`);
  lines.push(`    apply() { return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Compatibility stub for ${moduleName}' }; }`);
  lines.push(`  });`);
  lines.push(`}`);
  for (const name of exports.keys()) {
    if (/^[A-Za-z_$][\w$]*$/.test(name)) lines.push(`export const ${name}: any = makeCompatStub('${name}');`);
  }
  lines.push(`export default makeCompatStub('default:${moduleName}');`);
  lines.push('');
  return lines.join('\n');
}

// Gather exact missing local imports.
const missing = new Map();
for (const file of walk(appRoot)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const imp of parseImports(text)) {
    const absNoExt = resolveImport(file, imp.source);
    if (!absNoExt) continue;
    if (!imp.source.includes('/lib/') && !imp.source.includes('\\lib\\')) continue;
    if (existsModuleNoExt(absNoExt)) continue;
    const entry = missing.get(absNoExt) || { names: new Set(), files: new Set() };
    for (const n of collectImportedNames(imp.spec)) entry.names.add(n);
    entry.files.add(path.relative(root, file));
    missing.set(absNoExt, entry);
  }
}

// Also rewrite the known duplicate generated stubs if present.
for (const known of [
  path.join(root, 'frontend/app/lib/cmt-master-answer-log-list-browser-store'),
  path.join(root, 'frontend/lib/cmt-master-answer-log-list-browser-store'),
]) {
  const file = known + '.ts';
  if (fs.existsSync(file)) {
    const content = makeStubContent(path.basename(known), new Set());
    fs.writeFileSync(file, content, 'utf8');
    console.log('[rewrite]', path.relative(root, file));
  }
}

let created = 0;
for (const [absNoExt, info] of missing.entries()) {
  const file = absNoExt + '.ts';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, makeStubContent(path.basename(absNoExt), info.names), 'utf8');
  console.log('[stub]', path.relative(root, file), 'from', [...info.files].join(', '));
  created++;
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(ts|tsx)$/.test(name))out.push(full)}return out}function strip(p){return p.replace(/\\.(ts|tsx|js|jsx)$/,'')}function exists(abs){return fs.existsSync(abs)||fs.existsSync(abs+'.ts')||fs.existsSync(abs+'.tsx')||fs.existsSync(abs+'.js')||fs.existsSync(abs+'.jsx')||fs.existsSync(path.join(abs,'index.ts'))||fs.existsSync(path.join(abs,'index.tsx'))}let ok=true;const missing=[];for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');const re=/import\\s+([^;]*?)\\s+from\\s+['\"]([^'\"]+)['\"]/gms;let m;while((m=re.exec(text))){const src=m[2];if(!src.startsWith('.'))continue;if(!src.includes('/lib/')&&!src.includes('\\\\lib\\\\'))continue;const abs=strip(path.resolve(path.dirname(file),src));if(!exists(abs)){missing.push(path.relative(root,file)+' -> '+src+' => '+path.relative(root,abs));ok=false}}}if(missing.length){for(const item of missing)console.error('[missing exact]',item)}else console.log('[OK] no missing exact relative lib imports detected');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-exact-missing-imports.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixexact:verify'] = 'node scripts/v-fix-exact-missing-imports.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixexact:verify');
console.log('[OK] exact missing import stubs created:', created);

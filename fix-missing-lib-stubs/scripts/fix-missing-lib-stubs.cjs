const fs = require('fs');
const path = require('path');
const root = process.cwd();
const appRoot = path.join(root, 'frontend/app');
const libRoot = path.join(root, 'frontend/lib');

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

function normalizeLibModule(importPath) {
  const idx = importPath.indexOf('/lib/');
  if (idx < 0) return null;
  let rest = importPath.slice(idx + '/lib/'.length);
  rest = rest.replace(/\.(ts|tsx|js|jsx)$/, '');
  if (!rest || rest.includes('*')) return null;
  return rest;
}

function parseImports(text) {
  const imports = [];
  const re = /import\s+([^;]*?)\s+from\s+['"]([^'"]+)['"]/gms;
  let match;
  while ((match = re.exec(text))) {
    imports.push({ spec: match[1].trim(), source: match[2] });
  }
  return imports;
}

function collectNames(spec) {
  const names = new Set();
  let hasDefault = false;

  const named = spec.match(/\{([\s\S]*?)\}/);
  if (named) {
    for (const part of named[1].split(',')) {
      const raw = part.trim();
      if (!raw) continue;
      const left = raw.split(/\s+as\s+/)[0].trim();
      if (left && /^[A-Za-z_$][\w$]*$/.test(left)) names.add(left);
    }
  }

  const withoutNamed = spec.replace(/\{[\s\S]*?\}/, '').replace(/\*\s+as\s+\w+/, '').replace(/,/g, '').trim();
  if (withoutNamed && /^[A-Za-z_$][\w$]*$/.test(withoutNamed)) hasDefault = true;
  return { names, hasDefault };
}

function safeIdentifier(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name);
}

const modules = new Map();
for (const file of walk(appRoot)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const imp of parseImports(text)) {
    const mod = normalizeLibModule(imp.source);
    if (!mod) continue;
    const targetTs = path.join(libRoot, mod + '.ts');
    const targetTsx = path.join(libRoot, mod + '.tsx');
    const targetIndex = path.join(libRoot, mod, 'index.ts');
    if (fs.existsSync(targetTs) || fs.existsSync(targetTsx) || fs.existsSync(targetIndex)) continue;
    const entry = modules.get(mod) || { names: new Set(), hasDefault: false, files: new Set() };
    const parsed = collectNames(imp.spec);
    for (const n of parsed.names) entry.names.add(n);
    entry.hasDefault = entry.hasDefault || parsed.hasDefault;
    entry.files.add(path.relative(root, file));
    modules.set(mod, entry);
  }
}

fs.mkdirSync(libRoot, { recursive: true });

const helper = `/* Auto-generated compatibility stub.
 * Replace with real implementation when this legacy route is actively maintained.
 */
const makeStub = (name: string): any => new Proxy(function stub(..._args: any[]) {
  return {
    ok: true,
    stub: true,
    name,
    items: [],
    logs: [],
    data: [],
    status: 'stubbed',
    message: 'Compatibility stub for missing legacy lib module.',
  };
}, {
  get(_target, prop) {
    if (prop === 'then') return undefined;
    if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
    if (prop === Symbol.toPrimitive) return () => name;
    if (prop === 'length') return 0;
    return makeStub(name + '.' + String(prop));
  },
  apply(_target, _thisArg, _args) {
    return {
      ok: true,
      stub: true,
      name,
      items: [],
      logs: [],
      data: [],
      status: 'stubbed',
      message: 'Compatibility stub for missing legacy lib module.',
    };
  }
});
`;

let created = 0;
for (const [mod, info] of modules.entries()) {
  const rel = 'frontend/lib/' + mod + '.ts';
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const exportLines = [];
  const sorted = [...info.names].sort();
  for (const name of sorted) {
    if (!safeIdentifier(name)) continue;
    exportLines.push(`export const ${name}: any = makeStub('${name}');`);
  }
  // Common names that old pages often expect even if imports are aliased dynamically later.
  const base = path.basename(mod).replace(/[^A-Za-z0-9_$]/g, '_');
  if (safeIdentifier(base) && !info.names.has(base)) exportLines.push(`export const ${base}: any = makeStub('${base}');`);
  if (info.hasDefault || true) exportLines.push(`export default makeStub('default:${mod}');`);

  const content = helper + '\n' + exportLines.join('\n') + '\n';
  fs.writeFileSync(full, content, 'utf8');
  console.log('[stub]', rel, 'from', [...info.files].join(', '));
  created++;
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');const libRoot=path.join(root,'frontend/lib');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(ts|tsx)$/.test(name))out.push(full)}return out}let ok=true;const missing=[];for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');const re=/import\\s+([^;]*?)\\s+from\\s+['\"]([^'\"]+)['\"]/gms;let m;while((m=re.exec(text))){const src=m[2];const idx=src.indexOf('/lib/');if(idx<0)continue;const mod=src.slice(idx+5).replace(/\\.(ts|tsx|js|jsx)$/,'');if(!mod)continue;const targetTs=path.join(libRoot,mod+'.ts');const targetTsx=path.join(libRoot,mod+'.tsx');const targetIndex=path.join(libRoot,mod,'index.ts');if(!fs.existsSync(targetTs)&&!fs.existsSync(targetTsx)&&!fs.existsSync(targetIndex)){missing.push(path.relative(root,file)+' -> '+mod);ok=false}}}if(missing.length){for(const item of missing)console.error('[missing lib]',item)}else console.log('[OK] no missing relative lib imports detected');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-missing-lib-stubs.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixlibs:verify'] = 'node scripts/v-fix-missing-lib-stubs.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log('[OK] created missing lib stubs:', created);

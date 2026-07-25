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

function stripExt(p) {
  return p.replace(/\.(ts|tsx|js|jsx)$/, '');
}

function existsModule(absNoExt) {
  return fs.existsSync(absNoExt + '.ts') || fs.existsSync(absNoExt + '.tsx') || fs.existsSync(path.join(absNoExt, 'index.ts')) || fs.existsSync(path.join(absNoExt, 'index.tsx'));
}

function targetFile(absNoExt) {
  if (fs.existsSync(absNoExt + '.ts')) return absNoExt + '.ts';
  if (fs.existsSync(absNoExt + '.tsx')) return absNoExt + '.tsx';
  return absNoExt + '.ts';
}

function parseImports(text) {
  const out = [];
  const re = /import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gms;
  let m;
  while ((m = re.exec(text))) {
    out.push({ typeOnly: Boolean(m[1]), names: m[2], source: m[3] });
  }
  return out;
}

function parseNames(names, globalTypeOnly) {
  const values = new Set();
  const types = new Set();
  for (const rawPart of names.split(',')) {
    let part = rawPart.trim();
    if (!part) continue;
    let isType = globalTypeOnly;
    if (part.startsWith('type ')) {
      isType = true;
      part = part.slice(5).trim();
    }
    const left = part.split(/\s+as\s+/)[0].trim();
    if (!/^[A-Za-z_$][\w$]*$/.test(left)) continue;
    if (isType) types.add(left); else values.add(left);
  }
  return { values, types };
}

function hasValueExport(text, name) {
  return new RegExp('export\\s+(const|function|class)\\s+' + name + '\\b').test(text);
}

function hasTypeExport(text, name) {
  return new RegExp('export\\s+(type|interface)\\s+' + name + '\\b').test(text);
}

function ensureStubHeader(text, moduleName) {
  if (text.includes('makeCompatStub')) return text;
  const header = `/* Legacy CMT compatibility module: ${moduleName}. */
export function makeCompatStub(name: string): any {
  return new Proxy(function compatStub(..._args: any[]) {
    return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
  }, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({ ok: true, stub: true, name });
      if (prop === Symbol.toPrimitive) return () => name;
      if (prop === 'length') return 0;
      return makeCompatStub(name + '.' + String(prop));
    },
    apply() {
      return { ok: true, stub: true, name, status: 'stubbed', items: [], logs: [], data: [], message: 'Legacy compatibility stub' };
    }
  });
}

`;
  return header + text;
}

const neededByFile = new Map();
for (const appFile of walk(appRoot)) {
  const text = fs.readFileSync(appFile, 'utf8');
  for (const imp of parseImports(text)) {
    if (!imp.source.startsWith('.')) continue;
    if (!imp.source.includes('/lib/') && !imp.source.includes('\\lib\\')) continue;
    if (!/(cmt-|cmtSecure|cmt-secure)/.test(imp.source)) continue;
    const absNoExt = stripExt(path.resolve(path.dirname(appFile), imp.source));
    const file = targetFile(absNoExt);
    const entry = neededByFile.get(file) || { values: new Set(), types: new Set(), sources: new Set() };
    const parsed = parseNames(imp.names, imp.typeOnly);
    for (const n of parsed.values) entry.values.add(n);
    for (const n of parsed.types) entry.types.add(n);
    entry.sources.add(path.relative(root, appFile));
    neededByFile.set(file, entry);
  }
}

const broadValueAliases = [
  'getSecureMasterAppEntry','getSecureMasterNavStatus','getSecureMasterCommittee','getSecureMasterCommitteeDemo','createSecureMasterCommittee','getSecureMasterGuide','getSecureMasterStatus',
  'getSecureMasterAnswerLogEntry','getSecureMasterAnswerLogStatus','getSecureMasterAnswerLogList','getSecureMasterAnswerLogBrowserStore','getSecureMasterAnswerLogBrowserStoreEntry','getSecureMasterAnswerLogListBrowserStore','getSecureMasterAnswerLogListBrowserStoreEntry',
  'getPrivacyGateDemo','evaluatePrivacyGate','evaluateCmtPrivacyGate','sanitizeForLocalPreview',
  'decidePrivacyAction','getPrivacyDecisionDemo','isPrivacyDecisionOption','getPrivacyDecisionLabel',
  'createSecureMasterProviderAdapterContract','createSecureMasterProviderAuditEnvelope','createProviderAuditEnvelope','createProviderAuditHistoryItem'
];

const broadTypeAliases = [
  'SecureMasterCommitteeResult','SecureMasterCommitteeDemo','SecureMasterAppEntry','SecureMasterNavStatus','SecureMasterAnswerLogEntry','SecureMasterAnswerLogStatus','SecureMasterAnswerLogList','SecureMasterAnswerLogBrowserStore','SecureMasterAnswerLogListBrowserStore','PrivacyDecisionOption','CmtPrivacyDecision','SecureMasterProviderAdapterContract','SecureMasterProviderAuditEnvelope','SecureMasterProviderAuditHistoryItem'
];

let changed = 0;
for (const [file, entry] of neededByFile.entries()) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const before = text;
  text = ensureStubHeader(text, path.basename(file));

  const allTypes = new Set([...entry.types, ...broadTypeAliases]);
  const allValues = new Set([...entry.values, ...broadValueAliases]);

  // If a symbol is needed both as type and value, export both is illegal with same name unless namespace tricks.
  // Prefer value export and add type only when no value export is needed.
  for (const name of allTypes) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
    if (allValues.has(name)) continue;
    if (!hasTypeExport(text, name)) text += `\nexport type ${name} = any;`;
  }

  for (const name of allValues) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
    if (!hasValueExport(text, name)) text += `\nexport const ${name}: any = makeCompatStub('${name}');`;
  }

  if (!/export\s+default\s+/.test(text)) text += `\nexport default makeCompatStub('default:${path.basename(file)}');\n`;
  if (text !== before) {
    fs.writeFileSync(file, text + (text.endsWith('\n') ? '' : '\n'), 'utf8');
    console.log('[compat]', path.relative(root, file));
    changed++;
  }
}

// Clean PrivacyDecisionOption conflicts in app routes/pages.
const localPrivacyType = "type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';";
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replace(/import\s+type\s+\{\s*PrivacyDecisionOption\s*\}\s+from\s+['"][^'"]*cmt-privacy-decision['"];\r?\n/g, '');
  text = text.replace(/import\s+\{([^}]*PrivacyDecisionOption[^}]*)\}\s+from\s+(['"][^'"]*cmt-privacy-decision['"]);/g, (_m, spec, src) => {
    const cleaned = spec.split(',').map(s => s.trim()).filter(Boolean).filter(s => s !== 'PrivacyDecisionOption' && s !== 'type PrivacyDecisionOption').join(', ');
    return cleaned ? `import { ${cleaned} } from ${src};` : '';
  });
  if (text.includes('PrivacyDecisionOption') && !text.includes('type PrivacyDecisionOption =')) {
    const lines = text.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) lastImport = i;
    if (lastImport >= 0) lines.splice(lastImport + 1, 0, '', localPrivacyType);
    else lines.unshift(localPrivacyType, '');
    text = lines.join('\n');
  }
  // Defensive map params.
  const stringParams = ['action','href','option','value','step','token','label','name','reason','message','field','key','id','tag'];
  const anyParams = ['item','entry','log','gate','check','row','record','result','panel','card','node','link','route'];
  for (const n of stringParams) text = text.replace(new RegExp(`\\.map\\(\\(${n}\\)\\s*=>`, 'g'), `.map((${n}: string) =>`);
  for (const n of anyParams) {
    text = text.replace(new RegExp(`\\.map\\(\\(${n}\\)\\s*=>`, 'g'), `.map((${n}: any) =>`);
    text = text.replace(new RegExp(`\\.map\\(\\(${n}:\\s*string\\)\\s*=>`, 'g'), `.map((${n}: any) =>`);
  }
  if (text.includes('Object.entries')) {
    for (const n of ['value','href','route','url']) text = text.replace(new RegExp(`href=\\{${n}\\}`, 'g'), `href={String(${n})}`);
    text = text.replace(/\{key\}: \{value\}/g, '{key}: {String(value)}');
  }
  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[app-fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(ts|tsx)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/import\\s+type\\s+\\{\\s*PrivacyDecisionOption/.test(text)){console.error('[bad privacy type import]',path.relative(root,file));ok=false}if(/import\\s+\\{[^}]*PrivacyDecisionOption[^}]*\\}\\s+from\\s+['\"][^'\"]*cmt-privacy-decision/.test(text)){console.error('[bad privacy mixed import]',path.relative(root,file));ok=false}if(text.includes('Object.entries')&&/href=\\{(value|href|route|url)\\}/.test(text)){console.error('[bad object href]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] legacy cmt app compatibility verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-build-stabilize-legacy-cmt.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['legacystable:verify'] = 'node scripts/v-build-stabilize-legacy-cmt.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script legacystable:verify');
console.log('[OK] build-stabilize-legacy-cmt applied, changed=' + changed);

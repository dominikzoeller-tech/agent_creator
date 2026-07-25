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

function cleanImportSpec(spec) {
  return spec
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== 'type PrivacyDecisionOption')
    .filter((part) => part !== 'PrivacyDecisionOption')
    .join(', ');
}

let changed = 0;
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  // Remove standalone type imports.
  text = text.replace(/import\s+type\s+\{\s*PrivacyDecisionOption\s*\}\s+from\s+['"][^'"]*cmt-privacy-decision['"];\r?\n/g, '');

  // Clean mixed named imports that include type PrivacyDecisionOption.
  text = text.replace(/import\s+\{([^}]*PrivacyDecisionOption[^}]*)\}\s+from\s+(['"][^'"]*cmt-privacy-decision['"]);/g, (match, spec, source) => {
    const cleaned = cleanImportSpec(spec);
    if (!cleaned) return '';
    return `import { ${cleaned} } from ${source};`;
  });

  // If file still uses PrivacyDecisionOption and has no local alias, add one.
  if (text.includes('PrivacyDecisionOption') && !text.includes('type PrivacyDecisionOption =')) {
    const localTypeLine = "type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';";
    const nextImport = "import { NextResponse } from 'next/server';\n";
    if (text.includes(nextImport)) {
      text = text.replace(nextImport, nextImport + '\n' + localTypeLine + '\n');
    } else {
      const lines = text.split(/\r?\n/);
      let lastImport = -1;
      for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) lastImport = i;
      if (lastImport >= 0) lines.splice(lastImport + 1, 0, '', localTypeLine);
      else lines.unshift(localTypeLine, '');
      text = lines.join('\n');
    }
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(ts|tsx)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/import\\s+type\\s+\\{\\s*PrivacyDecisionOption/.test(text)){console.error('[bad standalone type import]',path.relative(root,file));ok=false}if(/import\\s+\\{[^}]*PrivacyDecisionOption[^}]*\\}\\s+from\\s+['\"][^'\"]*cmt-privacy-decision/.test(text)){console.error('[bad mixed import]',path.relative(root,file));ok=false}if(text.includes('PrivacyDecisionOption')&&!text.includes('type PrivacyDecisionOption =')){console.error('[missing local alias]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] privacy import conflicts fixed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-privacy-import-conflicts.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacyimports:verify'] = 'node scripts/v-fix-privacy-import-conflicts.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacyimports:verify');
console.log('[OK] privacy import conflict fix applied, changed=' + changed);

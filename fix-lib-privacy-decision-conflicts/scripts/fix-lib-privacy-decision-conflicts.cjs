const fs = require('fs');
const path = require('path');
const root = process.cwd();
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

let changed = 0;
for (const file of walk(libRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  // Only remove imported PrivacyDecisionOption when a local type declaration exists.
  if (text.includes('type PrivacyDecisionOption =')) {
    text = text.replace(/import\s+type\s+\{([^}]+)\}\s+from\s+(['"][^'"]*cmt-privacy-decision['"]);/g, (_match, spec, source) => {
      const names = spec
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => part !== 'PrivacyDecisionOption');
      if (names.length === 0) return '';
      return `import type { ${names.join(', ')} } from ${source};`;
    });

    text = text.replace(/import\s+\{([^}]*PrivacyDecisionOption[^}]*)\}\s+from\s+(['"][^'"]*cmt-privacy-decision['"]);/g, (_match, spec, source) => {
      const names = spec
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => part !== 'PrivacyDecisionOption' && part !== 'type PrivacyDecisionOption');
      if (names.length === 0) return '';
      return `import { ${names.join(', ')} } from ${source};`;
    });
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const libRoot=path.join(root,'frontend/lib');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(ts|tsx)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(libRoot)){const text=fs.readFileSync(file,'utf8');if(text.includes('type PrivacyDecisionOption =')&&/import\\s+type\\s+\\{[^}]*PrivacyDecisionOption[^}]*\\}\\s+from\\s+['\"][^'\"]*cmt-privacy-decision/.test(text)){console.error('[bad type import conflict]',path.relative(root,file));ok=false}if(text.includes('type PrivacyDecisionOption =')&&/import\\s+\\{[^}]*PrivacyDecisionOption[^}]*\\}\\s+from\\s+['\"][^'\"]*cmt-privacy-decision/.test(text)){console.error('[bad mixed import conflict]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] frontend/lib privacy decision conflicts removed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-lib-privacy-decision-conflicts.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixlibprivacy:verify'] = 'node scripts/v-fix-lib-privacy-decision-conflicts.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixlibprivacy:verify');
console.log('[OK] lib privacy decision conflict fix applied, changed=' + changed);

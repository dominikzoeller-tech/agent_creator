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
    else if (/\.(tsx|ts)$/.test(name)) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  // Fix broken join string that was split across two lines:
  // ].join('
  // ');
  text = text.replace(/\.join\('\r?\n'\)/g, ".join('\\\\n')");
  text = text.replace(/\.join\("\r?\n"\)/g, '.join("\\\\n")');

  // Also fix the specific rendered form with semicolon.
  text = text.replace(/\.join\('\r?\n'\);/g, ".join('\\\\n');");
  text = text.replace(/\.join\("\r?\n"\);/g, '.join("\\\\n");');

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.join\\(['\"]\\r?\\n['\"]\\)/.test(text)){console.error('[broken join]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] no broken join literals detected');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-broken-join-newlines.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixjoin:verify'] = 'node scripts/v-fix-broken-join-newlines.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixjoin:verify');
console.log('[OK] join newline fix applied, changed=' + changed);

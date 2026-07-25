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

function fixBrokenNewlineLiteral(text) {
  // Handles these broken forms:
  // .split('
  // ')
  // .split("
  // ")
  // .join('
  // ')
  // .join("
  // ")
  return text
    .replace(/\.split\('\r?\n'\)/g, ".split('\\\\n')")
    .replace(/\.split\('\r?\n'\);/g, ".split('\\\\n');")
    .replace(/\.split\("\r?\n"\)/g, '.split("\\\\n")')
    .replace(/\.split\("\r?\n"\);/g, '.split("\\\\n");')
    .replace(/\.join\('\r?\n'\)/g, ".join('\\\\n')")
    .replace(/\.join\('\r?\n'\);/g, ".join('\\\\n');")
    .replace(/\.join\("\r?\n"\)/g, '.join("\\\\n")')
    .replace(/\.join\("\r?\n"\);/g, '.join("\\\\n");');
}

let changed = 0;
for (const file of walk(appRoot)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = fixBrokenNewlineLiteral(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.(split|join)\\(['\"]\\r?\\n['\"]\\)/.test(text)){console.error('[broken split/join]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] no broken split/join newline literals detected');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-broken-split-join-newlines.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixsplitjoin:verify'] = 'node scripts/v-fix-broken-split-join-newlines.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixsplitjoin:verify');
console.log('[OK] split/join newline fix applied, changed=' + changed);

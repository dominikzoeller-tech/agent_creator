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

const paramTypes = new Map([
  ['href', 'string'],
  ['item', 'string'],
  ['link', 'string'],
  ['route', 'string'],
  ['entry', 'any'],
  ['log', 'any'],
  ['option', 'string'],
  ['value', 'string'],
  ['step', 'string'],
  ['token', 'string'],
  ['check', 'any'],
  ['stage', 'any'],
]);

let changed = 0;
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const [name, type] of paramTypes.entries()) {
    // Only annotate untyped single-parameter map callbacks: .map((href) =>
    const re = new RegExp(`\\.map\\(\\(${name}\\)\\s*=>`, 'g');
    text = text.replace(re, `.map((${name}: ${type}) =>`);
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.map\\(\\((href|item|link|route|option|value|step|token)\\)\\s*=>/.test(text)){console.error('[untyped map param]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] no common untyped map params detected');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-implicit-any-map-params.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixmapany:verify'] = 'node scripts/v-fix-implicit-any-map-params.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixmapany:verify');
console.log('[OK] implicit any map param fix applied, changed=' + changed);

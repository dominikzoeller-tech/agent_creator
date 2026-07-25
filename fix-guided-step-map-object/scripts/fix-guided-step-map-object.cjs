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

const objectParams = ['step', 'guidedStep', 'guided', 'section', 'tile', 'badge', 'metric', 'stat', 'summary', 'item', 'entry', 'link', 'route'];
let changed = 0;

for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const name of objectParams) {
    text = text.replace(new RegExp(`\\.map\\(\\(${name}:\\s*string\\)\\s*=>`, 'g'), `.map((${name}: any) =>`);
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.map\\(\\((step|guidedStep|guided|section|tile|badge|metric|stat|summary|item|entry|link|route):\\s*string\\)\\s*=>/.test(text)){console.error('[bad object map string type]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] guided/object map params are not typed as string');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-guided-step-map-object.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixguidedstep:verify'] = 'node scripts/v-fix-guided-step-map-object.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixguidedstep:verify');
console.log('[OK] guided step map object fix applied, changed=' + changed);

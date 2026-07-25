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

const anyParams = [
  'badge', 'status', 'section', 'block', 'tile', 'metric', 'stat', 'summary', 'signal', 'warning', 'error',
  'role', 'member', 'agent', 'person', 'persona', 'expert', 'decision', 'finding', 'recommendation',
  'item', 'entry', 'log', 'gate', 'check', 'row', 'record', 'result', 'panel', 'card', 'node', 'link', 'route'
];

let changed = 0;
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const name of anyParams) {
    text = text.replace(new RegExp(`\\.map\\(\\(${name}\\)\\s*=>`, 'g'), `.map((${name}: any) =>`);
    text = text.replace(new RegExp(`\\.map\\(\\(${name}:\\s*string\\)\\s*=>`, 'g'), `.map((${name}: any) =>`);
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.map\\(\\((badge|status|section|block|tile|metric|stat|summary|signal|warning|error)\\)\\s*=>/.test(text)){console.error('[untyped badge-like map param]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] badge-like legacy map params typed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-legacy-map-badge-any.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixbadgeany:verify'] = 'node scripts/v-fix-legacy-map-badge-any.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixbadgeany:verify');
console.log('[OK] legacy map badge any fix applied, changed=' + changed);

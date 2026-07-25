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

const stringParams = [
  'action', 'href', 'link', 'route', 'option', 'value', 'step', 'token', 'label', 'name', 'reason', 'message', 'field', 'key', 'id', 'tag'
];
const anyParams = [
  'item', 'entry', 'log', 'gate', 'check', 'row', 'record', 'result', 'panel', 'card', 'node'
];

let changed = 0;
for (const file of walk(appRoot)) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const name of stringParams) {
    const re = new RegExp(`\\.map\\(\\(${name}\\)\\s*=>`, 'g');
    text = text.replace(re, `.map((${name}: string) =>`);
  }

  for (const name of anyParams) {
    const re = new RegExp(`\\.map\\(\\(${name}\\)\\s*=>`, 'g');
    text = text.replace(re, `.map((${name}: any) =>`);
    const badString = new RegExp(`\\.map\\(\\(${name}:\\s*string\\)\\s*=>`, 'g');
    text = text.replace(badString, `.map((${name}: any) =>`);
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.map\\(\\((action|href|link|route|option|value|step|token|label|name|reason|message|field|key|id|tag)\\)\\s*=>/.test(text)){console.error('[untyped string map param]',path.relative(root,file));ok=false}if(/\\.map\\(\\((item|entry|log|gate|check|row|record|result|panel|card|node)\\)\\s*=>/.test(text)){console.error('[untyped object map param]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] common implicit any map params fixed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-more-implicit-any-params.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixmoreany:verify'] = 'node scripts/v-fix-more-implicit-any-params.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixmoreany:verify');
console.log('[OK] more implicit any map param fix applied, changed=' + changed);

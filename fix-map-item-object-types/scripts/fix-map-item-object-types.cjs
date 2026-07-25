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

  // Previous broad fix typed item as string. In many legacy pages item is an object.
  text = text.replace(/\.map\(\(item:\s*string\)\s*=>/g, '.map((item: any) =>');

  // Same defensive correction for object-like variable names that often get properties accessed.
  text = text.replace(/\.map\(\(entry:\s*string\)\s*=>/g, '.map((entry: any) =>');
  text = text.replace(/\.map\(\(log:\s*string\)\s*=>/g, '.map((log: any) =>');
  text = text.replace(/\.map\(\(gate:\s*string\)\s*=>/g, '.map((gate: any) =>');
  text = text.replace(/\.map\(\(check:\s*string\)\s*=>/g, '.map((check: any) =>');

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(/\\.map\\(\\((item|entry|log|gate|check):\\s*string\\)\\s*=>/.test(text)){console.error('[bad object map type]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] object-like map params are not typed as string');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-map-item-object-types.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixmapitem:verify'] = 'node scripts/v-fix-map-item-object-types.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixmapitem:verify');
console.log('[OK] map item object type fix applied, changed=' + changed);

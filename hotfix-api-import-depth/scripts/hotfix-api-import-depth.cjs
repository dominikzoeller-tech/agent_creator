const fs = require('fs');
const path = require('path');
const root = process.cwd();

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name === 'route.ts') out.push(full);
  }
  return out;
}

const apiRoot = path.join(root, 'frontend/app/api/cmt/master/secure');
const files = walk(apiRoot);
let changed = 0;

for (const full of files) {
  let text = fs.readFileSync(full, 'utf8');
  const before = text;

  // Normalize any relative import to frontend/lib from these API routes.
  text = text.replace(/from ['"](?:\.\.\/){4,8}lib\//g, "from '../../../../../../../lib/");

  if (text !== before) {
    fs.writeFileSync(full, text, 'utf8');
    console.log('[fix]', path.relative(root, full));
    changed++;
  } else {
    console.log('[ok]', path.relative(root, full));
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(name==='route.ts')out.push(full)}return out}let ok=true;const files=walk(path.join(root,'frontend/app/api/cmt/master/secure'));for(const full of files){const rel=path.relative(root,full);const text=fs.readFileSync(full,'utf8');const bad=text.match(/from ['\"](?:\.\.\/){4,6}lib\//);if(bad){console.error('[bad import]',rel,bad[0]);ok=false}else console.log('[ok route]',rel)}if(ok)console.log('[OK] hotfix api import depth verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-hotfix-api-import-depth.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['hotfixapi:verify'] = 'node scripts/v-hotfix-api-import-depth.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] scripts/v-hotfix-api-import-depth.cjs');
console.log('[write] package.json script hotfixapi:verify');
console.log('[OK] hotfix applied, changed=' + changed);

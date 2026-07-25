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

  // Target the actual TypeScript issue: Object.entries values are unknown, Link href needs string/Url.
  if (text.includes('Object.entries') && text.includes('href={value}')) {
    text = text.replace(/href=\{value\}/g, 'href={String(value)}');
    text = text.replace(/\{key\}: \{value\}/g, '{key}: {String(value)}');
  }

  // Defensive: common names used in Object.entries mappings.
  if (text.includes('Object.entries')) {
    for (const name of ['value', 'href', 'route', 'url']) {
      const hrefRe = new RegExp(`href=\\{${name}\\}`, 'g');
      text = text.replace(hrefRe, `href={String(${name})}`);
    }
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('[fix]', path.relative(root, file));
    changed++;
  }
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const appRoot=path.join(root,'frontend/app');function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const stat=fs.statSync(full);if(stat.isDirectory())walk(full,out);else if(/\\.(tsx|ts)$/.test(name))out.push(full)}return out}let ok=true;for(const file of walk(appRoot)){const text=fs.readFileSync(file,'utf8');if(text.includes('Object.entries')&&/href=\\{(value|href|route|url)\\}/.test(text)){console.error('[bad object href]',path.relative(root,file));ok=false}}if(ok)console.log('[OK] object entries Link href values are stringified');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-object-entries-link-href.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixobjecthref:verify'] = 'node scripts/v-fix-object-entries-link-href.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixobjecthref:verify');
console.log('[OK] object entries link href fix applied, changed=' + changed);

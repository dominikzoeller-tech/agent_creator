const fs = require('fs');
const path = require('path');
const root = process.cwd();
const rel = 'frontend/app/cmt/master/secure/page.tsx';
const full = path.join(root, rel);

if (!fs.existsSync(full)) {
  console.error('[missing]', rel);
  process.exit(1);
}

let text = fs.readFileSync(full, 'utf8');
const before = text;

const bad = 'toneColor[badge.tone]';
const good = 'toneColor[badge.tone as keyof typeof toneColor]';
text = text.replaceAll(bad, good);

// cleanup accidental double replacement
text = text.replaceAll(
  'toneColor[badge.tone as keyof typeof toneColor as keyof typeof toneColor]',
  good
);

if (text !== before) {
  fs.writeFileSync(full, text, 'utf8');
  console.log('[fix]', rel);
} else {
  console.log('[ok/no-change]', rel);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/app/cmt/master/secure/page.tsx';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');if(text.includes('toneColor[badge.tone]')){console.error('[bad] raw toneColor badge index remains');ok=false}else console.log('[ok] raw toneColor badge index removed');if(!text.includes('keyof typeof toneColor')){console.error('[missing] toneColor keyof cast');ok=false}else console.log('[ok] toneColor keyof cast found');if(ok)console.log('[OK] tone color index verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-tone-color-index.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixtoneindex:verify'] = 'node scripts/v-fix-tone-color-index.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixtoneindex:verify');
console.log('[OK] tone color index fix applied');

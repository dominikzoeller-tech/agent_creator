const fs = require('fs');
const path = require('path');
const root = process.cwd();
const rel = 'frontend/app/cmt/privacy/decision/page.tsx';
const full = path.join(root, rel);

if (!fs.existsSync(full)) {
  console.error('[missing]', rel);
  process.exit(1);
}

let text = fs.readFileSync(full, 'utf8');
const before = text;

// Remove PrivacyDecisionOption from a type import while preserving other imported types.
text = text.replace(/import\s+type\s+\{([^}]+)\}\s+from\s+(['"][^'"]*cmt-privacy-decision['"]);/g, (_match, spec, source) => {
  const names = spec
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== 'PrivacyDecisionOption');
  if (names.length === 0) return '';
  return `import type { ${names.join(', ')} } from ${source};`;
});

if (text !== before) {
  fs.writeFileSync(full, text, 'utf8');
  console.log('[fix]', rel);
} else {
  console.log('[ok/no-change]', rel);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/app/cmt/privacy/decision/page.tsx';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');if(/import\s+type\s+\{[^}]*PrivacyDecisionOption/.test(text)){console.error('[bad] PrivacyDecisionOption still imported as type');ok=false}else console.log('[ok] PrivacyDecisionOption type import removed');if(!text.includes('type PrivacyDecisionOption =')){console.error('[missing] local PrivacyDecisionOption type');ok=false}else console.log('[ok] local PrivacyDecisionOption type remains');if(ok)console.log('[OK] privacy decision page conflict verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-privacy-decision-page-conflict.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixprivacypage:verify'] = 'node scripts/v-fix-privacy-decision-page-conflict.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixprivacypage:verify');
console.log('[OK] privacy decision page conflict fix applied');

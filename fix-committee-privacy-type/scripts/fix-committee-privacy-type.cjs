const fs = require('fs');
const path = require('path');
const root = process.cwd();

const rel = 'frontend/app/api/cmt/master/secure/committee/route.ts';
const full = path.join(root, rel);
if (!fs.existsSync(full)) {
  console.error('[missing]', rel);
  process.exit(1);
}

let text = fs.readFileSync(full, 'utf8');

// Remove the problematic type import.
text = text.replace(/import\s+type\s+\{\s*PrivacyDecisionOption\s*\}\s+from\s+['"][^'"]*cmt-privacy-decision['"];\r?\n/g, '');

// Insert a local type alias if missing.
if (!text.includes('type PrivacyDecisionOption =')) {
  const anchor = "import { NextResponse } from 'next/server';\n";
  if (text.includes(anchor)) {
    text = text.replace(anchor, anchor + "\ntype PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';\n");
  } else {
    text = "type PrivacyDecisionOption = 'local_only' | 'anonymize_then_send' | 'approve_external_send' | 'cancel';\n" + text;
  }
}

fs.writeFileSync(full, text, 'utf8');
console.log('[write]', rel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/app/api/cmt/master/secure/committee/route.ts';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');if(/import\\s+type\\s+\\{\\s*PrivacyDecisionOption/.test(text)){console.error('[bad] still imports PrivacyDecisionOption type');ok=false}else console.log('[ok] no external PrivacyDecisionOption type import');if(!text.includes('type PrivacyDecisionOption =')){console.error('[missing] local PrivacyDecisionOption type');ok=false}else console.log('[ok] local PrivacyDecisionOption type');if(!text.includes('const options: PrivacyDecisionOption[]')){console.error('[missing] typed options');ok=false}else console.log('[ok] typed options');if(ok)console.log('[OK] committee privacy type verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-committee-privacy-type.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixcommitteeprivacy:verify'] = 'node scripts/v-fix-committee-privacy-type.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixcommitteeprivacy:verify');
console.log('[OK] fix-committee-privacy-type applied');

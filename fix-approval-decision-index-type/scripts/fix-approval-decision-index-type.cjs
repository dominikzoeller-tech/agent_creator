const fs = require('fs');
const path = require('path');
const root = process.cwd();
const rel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const full = path.join(root, rel);

if (!fs.existsSync(full)) {
  console.error('[missing]', rel);
  process.exit(1);
}

let text = fs.readFileSync(full, 'utf8');
const before = text;

const bad = 'secureMasterApprovalDecisionPreview.explanations[decision]';
const good = 'secureMasterApprovalDecisionPreview.explanations[decision as keyof typeof secureMasterApprovalDecisionPreview.explanations]';
text = text.replaceAll(bad, good);

// Defensive cleanup if prior patches already created nested replacements.
text = text.replaceAll(
  'secureMasterApprovalDecisionPreview.explanations[decision as keyof typeof secureMasterApprovalDecisionPreview.explanations as keyof typeof secureMasterApprovalDecisionPreview.explanations]',
  good
);

if (text !== before) {
  fs.writeFileSync(full, text, 'utf8');
  console.log('[fix]', rel);
} else {
  console.log('[ok/no-change]', rel);
}

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const rel='frontend/app/cmt/master/secure/agent/page.tsx';const full=path.join(root,rel);let ok=true;if(!fs.existsSync(full)){console.error('[missing]',rel);process.exit(1)}const text=fs.readFileSync(full,'utf8');if(text.includes('secureMasterApprovalDecisionPreview.explanations[decision]')){console.error('[bad] untyped approval decision index remains');ok=false}else console.log('[ok] approval decision index cast present or raw index removed');if(!text.includes('keyof typeof secureMasterApprovalDecisionPreview.explanations')){console.error('[missing] keyof typeof explanations cast');ok=false}else console.log('[ok] keyof cast found');if(ok)console.log('[OK] approval decision index verify passed');process.exit(ok?0:1);`;
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/v-fix-approval-decision-index-type.cjs'), verify, 'utf8');

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fixapprovalindex:verify'] = 'node scripts/v-fix-approval-decision-index-type.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json script fixapprovalindex:verify');
console.log('[OK] approval decision index type fix applied');

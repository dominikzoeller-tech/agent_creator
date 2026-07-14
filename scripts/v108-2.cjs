const fs = require('fs');
const path = require('path');
const root = process.cwd();
function ok(file, fragment) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + file);
  const text = fs.readFileSync(abs, 'utf8');
  if (fragment && !text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);
  console.log('OK', file, fragment || '');
}
ok('README_PHASE108_2.md', 'Phase 108.2');
ok('frontend/app/p108-2-dash/page.tsx', 'Phase 108.2 Dashboard');
ok('frontend/app/p108-2-dash/page.tsx', "provider: 'none'");
ok('frontend/app/p108-2-dash/page.tsx', "modelSelected: 'none'");
ok('frontend/app/p108-2-dash/page.tsx', 'dryRunOnly: true');
ok('frontend/app/p108-2-dash/page.tsx', 'finalDispatchBlocked: true');
ok('frontend/app/p108-2-dash/page.tsx', 'executionGateClosed: true');
ok('frontend/app/p108-2-dash/page.tsx', 'networkCallAllowed: false');
ok('frontend/app/p108-2-dash/page.tsx', 'providerDispatchAllowed: false');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!pkg.scripts || pkg.scripts['phase108:2:verify'] !== 'node scripts/v108-2.cjs') throw new Error('Missing package script phase108:2:verify');
if (!pkg.scripts || pkg.scripts['phase108:2:smoke'] !== 'node scripts/s108-2.cjs') throw new Error('Missing package script phase108:2:smoke');
console.log('Phase 108.2 verification OK.');

const fs = require('fs');
const path = require('path');
const root = process.cwd();
const checks = [
  ['README_PHASE82_1.md', 'Phase 82.1'],
  ['frontend/lib/p82-1-store.ts', "Omit<ReturnType<typeof getPhase82ArchiveSealFinalClosureBoundary>, 'phase'>"],
  ['frontend/lib/p82-1-store.ts', "phase: '82.1'"],
  ['frontend/lib/p82-1-store.ts', "boundaryPhase: '82.0'"],
  ['frontend/lib/p82-1-store.ts', 'policyAuditPassed: true'],
  ['frontend/lib/p82-1-store.ts', "auditEventType: 'agent_registry_status_changed'"],
  ['frontend/app/api/p82-1/route.ts', 'NextResponse.json'],
  ['frontend/app/p82-1/page.tsx', 'Phase 82.1']
];
for (const [rel, fragment] of checks) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);
  console.log('OK', rel);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts['phase82:1:verify'] !== 'node scripts/v82-1.cjs') throw new Error('Missing script phase82:1:verify');
console.log('Phase 82.1 verification OK.');

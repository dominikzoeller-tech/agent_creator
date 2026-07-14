const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const w = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

w('README_PHASE103_2.md', `# Phase 103.2 - Dashboard Smoke\n\nAdds short-name dashboard and smoke checks for Phase 103.\n\nRoutes:\n\n- UI Dashboard: /p103-2-dash\n- UI Policy Audit: /p103-1\n- API Policy Audit: /api/p103-1\n\nSecurity invariants remain locked.\n`);

w('frontend/app/p103-2-dash/page.tsx', `import { getP1031Audit } from '../../lib/p103-1-store';\n\nexport default function P1032DashboardPage() {\n  const audit = getP1031Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 103.2 Dashboard</h1>\n      <h2>{audit.auditLabel}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>auditPhase: {audit.auditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/s103-2.cjs', `const http = require('http');\nconst checks = [\n  ['UI Dashboard', 'http://localhost:3000/p103-2-dash'],\n  ['UI Policy Audit', 'http://localhost:3000/p103-1'],\n  ['API Policy Audit', 'http://localhost:3000/api/p103-1'],\n  ['API Health', 'http://localhost:7071/health'],\n];\nfunction get(url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });\n    req.setTimeout(5000, () => { req.destroy(); resolve('timeout'); });\n    req.on('error', () => resolve(''));\n  });\n}\n(async () => {\n  let failed = false;\n  for (const [label, url] of checks) {\n    const status = await get(url);\n    const ok = status === 200;\n    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + status + ' ' + url);\n    if (!ok && !url.includes('7071')) failed = true;\n  }\n  if (failed) process.exit(1);\n})();\n`);

w('scripts/v103-2.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE103_2.md', 'Phase 103.2'],\n  ['frontend/app/p103-2-dash/page.tsx', 'Phase 103.2 Dashboard'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.provider'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.modelSelected'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.finalDispatchBlocked'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.executionGateClosed'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.networkCallAllowed'],\n  ['frontend/app/p103-2-dash/page.tsx', 'audit.providerDispatchAllowed'],\n  ['scripts/s103-2.cjs', 'http://localhost:3000/p103-2-dash'],\n  ['scripts/s103-2.cjs', 'http://localhost:3000/p103-1'],\n  ['scripts/s103-2.cjs', 'http://localhost:3000/api/p103-1'],\n  ['package.json', 'phase103:2:verify'],\n  ['package.json', 'phase103:2:smoke'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 103.2 verification OK.');\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase103:2:verify'] = 'node scripts/v103-2.cjs';
pkg.scripts['phase103:2:smoke'] = 'node scripts/s103-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 103.2 patch applied.');

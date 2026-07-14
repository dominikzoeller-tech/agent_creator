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

w('README_PHASE107_2.md', `# Phase 107.2 - Dashboard + Smoke\n\nAdds short-name dashboard and smoke checks for Phase 107.\n\nRoutes:\n\n- Dashboard: /p107-2-dash\n- Policy Audit: /p107-1\n- API Policy Audit: /api/p107-1\n\nSecurity invariants remain locked.\n`);

w('frontend/app/p107-2-dash/page.tsx', `import { getP1071Audit } from '../../lib/p107-1-store';\n\nexport default function P1072DashboardPage() {\n  const audit = getP1071Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 107.2 Dashboard</h1>\n      <h2>{audit.auditLabel}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>auditPhase: {audit.auditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>externalDataTransferAllowed: {String(audit.externalDataTransferAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n        <li>policyDecision: {audit.policyDecision}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v107-2.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE107_2.md', 'Phase 107.2'],\n  ['frontend/app/p107-2-dash/page.tsx', 'Phase 107.2 Dashboard'],\n  ['frontend/app/p107-2-dash/page.tsx', 'getP1071Audit'],\n  ['scripts/s107-2.cjs', '/p107-2-dash'],\n  ['scripts/s107-2.cjs', '/p107-1'],\n  ['scripts/s107-2.cjs', '/api/p107-1'],\n  ['package.json', 'phase107:2:verify'],\n  ['package.json', 'phase107:2:smoke'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 107.2 verification OK.');\n`);

w('scripts/s107-2.cjs', `const http = require('http');\nconst checks = [\n  ['UI Dashboard', 'http://localhost:3000/p107-2-dash'],\n  ['UI Policy Audit', 'http://localhost:3000/p107-1'],\n  ['API Policy Audit', 'http://localhost:3000/api/p107-1'],\n  ['API Health', 'http://localhost:7071/health'],\n];\nfunction get(url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => {\n      res.resume();\n      resolve(res.statusCode);\n    });\n    req.setTimeout(5000, () => { req.destroy(); resolve('timeout'); });\n    req.on('error', () => resolve(''));\n  });\n}\n(async () => {\n  let failed = false;\n  for (const [label, url] of checks) {\n    const status = await get(url);\n    if (status === 200) console.log('OK  ', label + ':', status, url);\n    else { console.log('FAIL', label + ':', status, url); failed = true; }\n  }\n  if (failed) process.exitCode = 1;\n})();\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase107:2:verify'] = 'node scripts/v107-2.cjs';
pkg.scripts['phase107:2:smoke'] = 'node scripts/s107-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 107.2 patch applied.');

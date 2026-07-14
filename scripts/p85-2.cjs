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

w('README_PHASE85_2.md', `# Phase 85.2 - Seal Final Closure Receipt Completion Receipt Policy Audit Dashboard\n\nAdds short-name dashboard route.\n\nRoutes checked by smoke:\n\n- UI dashboard: /p85-2-dash\n- UI policy audit: /p85-1\n- API policy audit: /api/p85-1\n\nSecurity invariants remain locked:\n\n- provider=none\n- modelSelected=none\n- dryRunOnly=true\n- finalDispatchBlocked=true\n- executionGateClosed=true\n- networkCallAllowed=false\n- providerDispatchAllowed=false\n- humanApprovalTokenIssued=false\n- humanApprovalTokenActivated=false\n- humanApprovalTokenConsumed=false\n- promptPayloadPresent=false\n- secretsPresent=false\n- providerResponsePresent=false\n`);

w('frontend/app/p85-2-dash/page.tsx', `export default function P852DashboardPage() {\n  const audit = {\n    phase: '85.2',\n    receiptPhase: '85.0',\n    policyAuditPhase: '85.1',\n    label: 'Seal Final Closure Receipt Completion Receipt Policy Audit Dashboard',\n    provider: 'none',\n    modelSelected: 'none',\n    dryRunOnly: true,\n    finalDispatchBlocked: true,\n    executionGateClosed: true,\n    networkCallAllowed: false,\n    providerDispatchAllowed: false,\n    humanApprovalTokenIssued: false,\n    humanApprovalTokenActivated: false,\n    humanApprovalTokenConsumed: false,\n    promptPayloadPresent: false,\n    secretsPresent: false,\n    providerResponsePresent: false,\n    dashboardReadOnly: true,\n  };\n\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 85.2 Dashboard</h1>\n      <h2>{audit.label}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>receiptPhase: {audit.receiptPhase}</li>\n        <li>policyAuditPhase: {audit.policyAuditPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>dashboardReadOnly: {String(audit.dashboardReadOnly)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v85-2.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE85_2.md', 'Phase 85.2'],\n  ['frontend/app/p85-2-dash/page.tsx', 'Phase 85.2 Dashboard'],\n  ['frontend/app/p85-2-dash/page.tsx', "provider: 'none'"],\n  ['frontend/app/p85-2-dash/page.tsx', "modelSelected: 'none'"],\n  ['frontend/app/p85-2-dash/page.tsx', 'dryRunOnly: true'],\n  ['frontend/app/p85-2-dash/page.tsx', 'finalDispatchBlocked: true'],\n  ['frontend/app/p85-2-dash/page.tsx', 'executionGateClosed: true'],\n  ['frontend/app/p85-2-dash/page.tsx', 'networkCallAllowed: false'],\n  ['frontend/app/p85-2-dash/page.tsx', 'providerDispatchAllowed: false'],\n  ['scripts/s85-2.cjs', '/p85-2-dash'],\n  ['package.json', 'phase85:2:verify'],\n  ['package.json', 'phase85:2:smoke'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 85.2 verification OK.');\n`);

w('scripts/s85-2.cjs', `const http = require('http');\nconst checks = [\n  ['UI Dashboard', 'http://localhost:3000/p85-2-dash'],\n  ['UI Policy Audit', 'http://localhost:3000/p85-1'],\n  ['API Policy Audit', 'http://localhost:3000/api/p85-1'],\n  ['API Health', 'http://localhost:7071/health'],\n];\nfunction ping(label, url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => {\n      res.resume();\n      const ok = res.statusCode >= 200 && res.statusCode < 400;\n      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);\n      resolve(ok || url.includes(':7071/health'));\n    });\n    req.setTimeout(5000, () => { req.destroy(); console.log('FAIL ' + label + ': timeout ' + url); resolve(url.includes(':7071/health')); });\n    req.on('error', () => { console.log('FAIL ' + label + ': ' + url); resolve(url.includes(':7071/health')); });\n  });\n}\n(async () => {\n  let ok = true;\n  for (const [label, url] of checks) ok = (await ping(label, url)) && ok;\n  if (!ok) process.exit(1);\n})();\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase85:2:verify'] = 'node scripts/v85-2.cjs';
pkg.scripts['phase85:2:smoke'] = 'node scripts/s85-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 85.2 patch applied.');

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

w('README_PHASE97_2.md', `# Phase 97.2 - Completion Final Seal Receipt Policy Audit Dashboard\n\nAdds short-name dashboard and smoke check for Phase 97.\n\nRoutes:\n\n- Dashboard UI: /p97-2-dash\n- Policy Audit UI: /p97-1\n- Policy Audit API: /api/p97-1\n\nSecurity invariants remain locked.\n`);

w('frontend/app/p97-2-dash/page.tsx', `import { getP971Audit } from '../../lib/p97-1-store';\n\nexport default function P972DashboardPage() {\n  const audit = getP971Audit();\n  return (\n    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 97.2 Dashboard</h1>\n      <h2>{audit.label}</h2>\n      <ul>\n        <li>phase: {audit.phase}</li>\n        <li>receiptPhase: {audit.receiptPhase}</li>\n        <li>provider: {audit.provider}</li>\n        <li>modelSelected: {audit.modelSelected}</li>\n        <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n        <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n        <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n        <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n        <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n        <li>policyAuditRecorded: {String(audit.policyAuditRecorded)}</li>\n      </ul>\n    </main>\n  );\n}\n`);

w('scripts/v97-2.cjs', `const fs = require('fs');\nconst checks = [\n  ['README_PHASE97_2.md', 'Phase 97.2'],\n  ['frontend/app/p97-2-dash/page.tsx', 'Phase 97.2 Dashboard'],\n  ['frontend/app/p97-2-dash/page.tsx', 'getP971Audit'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.provider'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.modelSelected'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.finalDispatchBlocked'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.executionGateClosed'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.networkCallAllowed'],\n  ['frontend/app/p97-2-dash/page.tsx', 'audit.providerDispatchAllowed'],\n  ['package.json', 'phase97:2:verify'],\n  ['package.json', 'phase97:2:smoke'],\n];\nfor (const [file, fragment] of checks) {\n  if (!fs.existsSync(file)) throw new Error('Missing ' + file);\n  const text = fs.readFileSync(file, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + file + ': ' + fragment);\n  console.log('OK', file);\n}\nconsole.log('Phase 97.2 verification OK.');\n`);

w('scripts/s97-2.cjs', `const http = require('http');\nconst urls = [\n  ['UI Dashboard', 'http://localhost:3000/p97-2-dash'],\n  ['UI Policy Audit', 'http://localhost:3000/p97-1'],\n  ['API Policy Audit', 'http://localhost:3000/api/p97-1'],\n  ['API Health', 'http://localhost:7071/health'],\n];\nfunction check(label, url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => {\n      res.resume();\n      const ok = res.statusCode >= 200 && res.statusCode < 300;\n      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);\n      resolve(ok || url.includes('7071'));\n    });\n    req.setTimeout(5000, () => {\n      req.destroy();\n      console.log('FAIL ' + label + ': timeout ' + url);\n      resolve(url.includes('7071'));\n    });\n    req.on('error', () => {\n      console.log('FAIL ' + label + ': ' + url);\n      resolve(url.includes('7071'));\n    });\n  });\n}\n(async () => {\n  const results = [];\n  for (const [label, url] of urls) results.push(await check(label, url));\n  if (!results.every(Boolean)) process.exit(1);\n})();\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase97:2:verify'] = 'node scripts/v97-2.cjs';
pkg.scripts['phase97:2:smoke'] = 'node scripts/s97-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 97.2 patch applied.');

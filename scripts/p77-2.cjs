const fs = require('fs');
const path = require('path');
const os = require('os');
const root = process.cwd();
const slug = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit';
const dash = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-dashboard';
const base = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt';
const store = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-store';
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + os.EOL, 'utf8');

write('README_PHASE77_2.md', `# Phase 77.2\n\nDashboard and smoke check for archive completion final closure finalization receipt policy audit.\n\nShort script names are used intentionally to avoid Windows path length issues.\n`);

write(`frontend/app/${dash}/page.tsx`, `import { getArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit } from '../../lib/${store}';\n\nexport default function Page() {\n  const audit = getArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit();\n  return (\n    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 77.2 Dashboard</h1>\n      <section>\n        <h2>Archive Completion Final Closure Finalization Receipt Policy Audit</h2>\n        <ul>\n          <li>phase: {audit.phase}</li>\n          <li>receiptPhase: {audit.receiptPhase}</li>\n          <li>provider: {audit.provider}</li>\n          <li>modelSelected: {audit.modelSelected}</li>\n          <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n          <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n          <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n          <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n          <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n          <li>policyAuditPassed: {String(audit.policyAuditPassed)}</li>\n        </ul>\n      </section>\n    </main>\n  );\n}\n`);

write('scripts/v77-2.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE77_2.md', 'Phase 77.2'],\n  ['frontend/app/${dash}/page.tsx', 'Phase 77.2 Dashboard'],\n  ['frontend/app/${dash}/page.tsx', 'audit.provider'],\n  ['frontend/app/${dash}/page.tsx', 'audit.modelSelected'],\n  ['frontend/app/${dash}/page.tsx', 'audit.dryRunOnly'],\n  ['frontend/app/${dash}/page.tsx', 'audit.finalDispatchBlocked'],\n  ['frontend/app/${dash}/page.tsx', 'audit.executionGateClosed'],\n  ['frontend/app/${dash}/page.tsx', 'audit.networkCallAllowed'],\n  ['frontend/app/${dash}/page.tsx', 'audit.providerDispatchAllowed']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel);\n}\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (!pkg.scripts || pkg.scripts['phase77:2:verify'] !== 'node scripts/v77-2.cjs') throw new Error('Missing script phase77:2:verify');\nif (!pkg.scripts['phase77:2:smoke']) throw new Error('Missing script phase77:2:smoke');\nconsole.log('Phase 77.2 verification OK.');\n`);

write('scripts/s77-2.cjs', `const http = require('http');\nconst urls = [\n  ['UI Dashboard', 'http://localhost:3000/${dash}'],\n  ['UI Policy Audit', 'http://localhost:3000/${slug}'],\n  ['UI Receipt', 'http://localhost:3000/${base}'],\n  ['API Policy Audit', 'http://localhost:3000/api/${slug}'],\n  ['API Receipt', 'http://localhost:3000/api/${base}'],\n  ['API Health', 'http://localhost:7071/health']\n];\nfunction check(name, url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => {\n      const ok = res.statusCode >= 200 && res.statusCode < 300;\n      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + res.statusCode + ' ' + url);\n      res.resume();\n      resolve(ok);\n    });\n    req.on('error', () => { console.log('FAIL ' + name + ': ' + url); resolve(false); });\n    req.setTimeout(3000, () => { req.destroy(); console.log('FAIL ' + name + ': timeout ' + url); resolve(false); });\n  });\n}\n(async () => {\n  let ok = true;\n  for (const [name, url] of urls) {\n    const result = await check(name, url);\n    if (name !== 'API Health') ok = ok && result;\n  }\n  if (!ok) process.exitCode = 1;\n})();\n`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase77:2:verify'] = 'node scripts/v77-2.cjs';
pkg.scripts['phase77:2:smoke'] = 'node scripts/s77-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 77.2 patch applied.');

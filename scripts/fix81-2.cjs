const fs = require('fs');
const path = require('path');
const os = require('os');

const root = process.cwd();
const oldRoute = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-policy-audit-dashboard';
const newRoute = 'p81-2-dash';
const base = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt';
const slug = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-policy-audit';
const store = 'provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-seal-final-receipt-policy-audit-store';
const oldDir = path.join(root, 'frontend', 'app', oldRoute);
const newDir = path.join(root, 'frontend', 'app', newRoute);

function write(rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, os.EOL), 'utf8');
  console.log('wrote', rel);
}

function removeIfExists(abs) {
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log('removed', path.relative(root, abs));
  }
}

// 1) Ensure short dashboard route directory exists and the too-long route is gone.
if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) {
  fs.renameSync(oldDir, newDir);
  console.log('renamed long dashboard route to', path.relative(root, newDir));
} else if (fs.existsSync(oldDir) && fs.existsSync(newDir)) {
  removeIfExists(oldDir);
}

// 2) Recreate the dashboard page in the short route to avoid any missing/corrupted file.
write(`frontend/app/${newRoute}/page.tsx`, `import { getArchiveCompletionFinalClosureFinalizationSealFinalReceiptPolicyAudit } from '../../lib/${store}';\n\nexport default function Page() {\n  const audit = getArchiveCompletionFinalClosureFinalizationSealFinalReceiptPolicyAudit();\n  return (\n    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>\n      <h1>Phase 81.2 Dashboard</h1>\n      <section>\n        <h2>Archive Completion Final Closure Finalization Seal Final Receipt Policy Audit</h2>\n        <ul>\n          <li>phase: {audit.phase}</li>\n          <li>receiptPhase: {audit.receiptPhase}</li>\n          <li>provider: {audit.provider}</li>\n          <li>modelSelected: {audit.modelSelected}</li>\n          <li>dryRunOnly: {String(audit.dryRunOnly)}</li>\n          <li>finalDispatchBlocked: {String(audit.finalDispatchBlocked)}</li>\n          <li>executionGateClosed: {String(audit.executionGateClosed)}</li>\n          <li>networkCallAllowed: {String(audit.networkCallAllowed)}</li>\n          <li>providerDispatchAllowed: {String(audit.providerDispatchAllowed)}</li>\n          <li>policyAuditPassed: {String(audit.policyAuditPassed)}</li>\n        </ul>\n      </section>\n    </main>\n  );\n}\n`);

// 3) Rewrite verification and smoke scripts from scratch so previous corrupted content is gone.
write('scripts/v81-2.cjs', `const fs = require('fs');\nconst path = require('path');\nconst root = process.cwd();\nconst checks = [\n  ['README_PHASE81_2.md', 'Phase 81.2'],\n  ['frontend/app/${newRoute}/page.tsx', 'Phase 81.2 Dashboard'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.provider'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.modelSelected'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.dryRunOnly'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.finalDispatchBlocked'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.executionGateClosed'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.networkCallAllowed'],\n  ['frontend/app/${newRoute}/page.tsx', 'audit.providerDispatchAllowed']\n];\nfor (const [rel, fragment] of checks) {\n  const abs = path.join(root, rel);\n  if (!fs.existsSync(abs)) throw new Error('Missing file: ' + rel);\n  const text = fs.readFileSync(abs, 'utf8');\n  if (!text.includes(fragment)) throw new Error('Missing fragment in ' + rel + ': ' + fragment);\n  console.log('OK', rel);\n}\nconst badPath = path.join(root, 'frontend', 'app', '${oldRoute}');\nif (fs.existsSync(badPath)) throw new Error('Long dashboard route still exists: frontend/app/${oldRoute}');\nconst pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));\nif (pkg.scripts['phase81:2:verify'] !== 'node scripts/v81-2.cjs') throw new Error('Missing script phase81:2:verify');\nif (pkg.scripts['phase81:2:smoke'] !== 'node scripts/s81-2.cjs') throw new Error('Missing script phase81:2:smoke');\nconsole.log('Phase 81.2 verification OK.');\n`);

write('scripts/s81-2.cjs', `const http = require('http');\nconst urls = [\n  ['UI Dashboard', 'http://localhost:3000/${newRoute}'],\n  ['UI Policy Audit', 'http://localhost:3000/${slug}'],\n  ['UI Receipt', 'http://localhost:3000/${base}'],\n  ['API Policy Audit', 'http://localhost:3000/api/${slug}'],\n  ['API Receipt', 'http://localhost:3000/api/${base}'],\n  ['API Health', 'http://localhost:7071/health']\n];\nfunction check(name, url) {\n  return new Promise((resolve) => {\n    const req = http.get(url, (res) => {\n      const ok = res.statusCode >= 200 && res.statusCode < 300;\n      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + res.statusCode + ' ' + url);\n      res.resume();\n      resolve(ok);\n    });\n    req.on('error', () => { console.log('FAIL ' + name + ': ' + url); resolve(false); });\n    req.setTimeout(3000, () => { req.destroy(); console.log('FAIL ' + name + ': timeout ' + url); resolve(false); });\n  });\n}\n(async () => {\n  let ok = true;\n  for (const [name, url] of urls) {\n    const result = await check(name, url);\n    if (name !== 'API Health') ok = ok && result;\n  }\n  if (!ok) process.exitCode = 1;\n})();\n`);

// 4) Keep README short and accurate.
write('README_PHASE81_2.md', `# Phase 81.2\n\nDashboard and smoke check for archive completion final closure finalization seal final receipt policy audit.\n\nUses short dashboard route: /${newRoute}\n\nShort script and route names are used intentionally to avoid Windows path length issues.\n`);
write('README_P81_2_ZIP.md', 'Phase 81.2 hotfix applied. Short route: /p81-2-dash\n');

// 5) Update package.json scripts.
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase81:2:verify'] = 'node scripts/v81-2.cjs';
pkg.scripts['phase81:2:smoke'] = 'node scripts/s81-2.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + os.EOL, 'utf8');

console.log('Phase 81.2 hotfix complete.');

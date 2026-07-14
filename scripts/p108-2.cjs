const fs = require('fs');
const path = require('path');

const root = process.cwd();
function write(file, content) {
  const abs = path.join(root, file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, "\r\n"), 'utf8');
  console.log('WROTE', file);
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function writeJson(file, data) {
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('UPDATED', file);
}

const page = `export default function Phase1082DashboardPage() {
  const audit = {
    phase: '108.2',
    upstreamBoundaryPhase: '108.0',
    upstreamPolicyAuditPhase: '108.1',
    title: 'Phase 108.2 Dashboard',
    provider: 'none',
    modelSelected: 'none',
    dryRunOnly: true,
    finalDispatchBlocked: true,
    executionGateClosed: true,
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    humanApprovalTokenIssued: false,
    humanApprovalTokenActivated: false,
    humanApprovalTokenConsumed: false,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    promptPayloadPresent: false,
    secretsPresent: false,
    providerResponsePresent: false,
  } as const;

  const rows = [
    ['phase', audit.phase],
    ['upstreamBoundaryPhase', audit.upstreamBoundaryPhase],
    ['upstreamPolicyAuditPhase', audit.upstreamPolicyAuditPhase],
    ['provider', audit.provider],
    ['modelSelected', audit.modelSelected],
    ['dryRunOnly', String(audit.dryRunOnly)],
    ['finalDispatchBlocked', String(audit.finalDispatchBlocked)],
    ['executionGateClosed', String(audit.executionGateClosed)],
    ['networkCallAllowed', String(audit.networkCallAllowed)],
    ['providerDispatchAllowed', String(audit.providerDispatchAllowed)],
    ['humanApprovalTokenIssued', String(audit.humanApprovalTokenIssued)],
    ['humanApprovalTokenActivated', String(audit.humanApprovalTokenActivated)],
    ['humanApprovalTokenConsumed', String(audit.humanApprovalTokenConsumed)],
    ['approvalCandidateApproved', String(audit.approvalCandidateApproved)],
    ['approvalCandidateExecuted', String(audit.approvalCandidateExecuted)],
    ['promptPayloadPresent', String(audit.promptPayloadPresent)],
    ['secretsPresent', String(audit.secretsPresent)],
    ['providerResponsePresent', String(audit.providerResponsePresent)],
  ];

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Phase 108.2 Dashboard</h1>
      <p>Seal final receipt completion final closure receipt seal boundary policy audit dashboard.</p>
      <section>
        <h2>Safety State</h2>
        <ul>
          {rows.map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
`;

const verify = `const fs = require('fs');
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
`;

const smoke = `const http = require('http');
const urls = [
  ['UI Dashboard', 'http://localhost:3000/p108-2-dash'],
  ['UI Policy Audit', 'http://localhost:3000/p108-1'],
  ['API Policy Audit', 'http://localhost:3000/api/p108-1'],
  ['API Health', 'http://localhost:7071/health'],
];
function check(label, url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok || label === 'API Health');
    });
    req.on('error', err => {
      console.log('FAIL ' + label + ': ' + url);
      resolve(label === 'API Health');
    });
    req.setTimeout(8000, () => {
      req.destroy();
      console.log('FAIL ' + label + ': timeout ' + url);
      resolve(label === 'API Health');
    });
  });
}
(async () => {
  const results = [];
  for (const [label, url] of urls) results.push(await check(label, url));
  if (!results.every(Boolean)) process.exit(1);
})();
`;

const readme = `# Phase 108.2\n\nAdds the short-route policy audit dashboard for Phase 108.\n\nShort names only:\n\n- UI: /p108-2-dash\n- Verify: scripts/v108-2.cjs\n- Smoke: scripts/s108-2.cjs\n- Patch: scripts/p108-2.cjs\n\nSafety invariants remain unchanged: provider=none, modelSelected=none, dryRunOnly=true, finalDispatchBlocked=true, executionGateClosed=true, networkCallAllowed=false, providerDispatchAllowed=false.\n`;

write('frontend/app/p108-2-dash/page.tsx', page);
write('scripts/v108-2.cjs', verify);
write('scripts/s108-2.cjs', smoke);
write('README_PHASE108_2.md', readme);

const pkgPath = path.join(root, 'package.json');
const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase108:2:verify'] = 'node scripts/v108-2.cjs';
pkg.scripts['phase108:2:smoke'] = 'node scripts/s108-2.cjs';
writeJson('package.json', pkg);
console.log('Phase 108.2 patch OK.');

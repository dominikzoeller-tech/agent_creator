const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const gateLib = `export type SecureMasterLiveTestGateResult = {
  ok: boolean;
  checkedAt: string;
  liveTestGatePrepared: true;
  canStartLiveTest: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  manualApprovalRequired: true;
  realSecretsRequiredServerSide: true;
  clientSecretsAllowed: false;
  requiredBeforeLiveTest: string[];
  blockedReasons: string[];
  nextSafeStep: string;
};

export function createSecureMasterLiveTestGateResult(): SecureMasterLiveTestGateResult {
  const blockedReasons = [
    'Provider ist noch nicht aktiv.',
    'Live-Modell ist noch nicht aktiv.',
    'Externe Weitergabe ist noch nicht freigegeben.',
    'Echte Secrets duerfen nicht im Client liegen.',
    'Manuelle Live-Test-Freigabe fehlt noch.',
  ];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    liveTestGatePrepared: true,
    canStartLiveTest: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    manualApprovalRequired: true,
    realSecretsRequiredServerSide: true,
    clientSecretsAllowed: false,
    requiredBeforeLiveTest: [
      'Build muss gruen sein',
      'Secret/Git-Preflight muss gruen sein',
      'Budget-/Token-Limit muss gruen sein',
      'Audit-Verlauf muss funktionieren',
      'Serverseitiger Provider-Adapter muss vorhanden sein',
      'Provider-Key muss nur serverseitig in .env.local liegen',
      'Manueller Live-Test-Schalter muss explizit aktiviert werden',
      'Testfrage darf keine internen oder personenbezogenen Daten enthalten',
    ],
    blockedReasons,
    nextSafeStep: 'Jetzt ist die Live-Test-Schwelle vorbereitet. Naechster Patch darf den ersten echten Live-Test vorbereiten, aber nur mit serverseitigem ENV-Key und expliziter manueller Freigabe.',
  };
}
`;
write('frontend/lib/cmt-secure-master-live-test-gate.ts', gateLib);

const route = `import { NextResponse } from 'next/server';
import { createSecureMasterLiveTestGateResult } from '../../../../../../lib/cmt-secure-master-live-test-gate';

export async function GET() {
  return NextResponse.json(createSecureMasterLiveTestGateResult());
}
`;
write('frontend/app/api/cmt/master/secure/live-test/gate/route.ts', route);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [liveTestGateResult, setLiveTestGateResult]')) {
  page = page.replace(
    "const [budgetPreflightResult, setBudgetPreflightResult] = useState<any | null>(null);",
    "const [budgetPreflightResult, setBudgetPreflightResult] = useState<any | null>(null);\n  const [liveTestGateResult, setLiveTestGateResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runLiveTestGate')) {
  page = page.replace(
    "async function runBudgetPreflight() {",
    "async function runLiveTestGate() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/live-test/gate');\n      setLiveTestGateResult(await response.json());\n    } catch (error) {\n      setLiveTestGateResult({ ok: false, error: 'live_test_gate_failed' });\n    }\n  }\n\n  async function runBudgetPreflight() {"
  );
}

if (!page.includes('liveTestGateResult,')) {
  page = page.replace(
    "budgetPreflightResult,",
    "budgetPreflightResult, liveTestGateResult,"
  );
}

if (!page.includes('Manueller Live-Test-Schalter')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Manueller Live-Test-Schalter</h2>\n          <p style={{ color: '#fecaca' }}>Live-Test-Gate ist vorbereitet. Echter Live-Test bleibt noch blockiert, bis du explizit freigibst und serverseitige ENV-Werte sauber gesetzt sind.</p>\n          <button onClick={runLiveTestGate} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Test-Gate pruefen</button>\n          {liveTestGateResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Gate vorbereitet: <b>{String(liveTestGateResult.liveTestGatePrepared)}</b></p>\n              <p>Live-Test startbar: <b>{String(liveTestGateResult.canStartLiveTest)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(liveTestGateResult.providerCallAllowed)}</b></p>\n              <p>Live-Modell aktiv: <b>{String(liveTestGateResult.liveModelEnabled)}</b></p>\n              <p>Client-Secrets erlaubt: <b>{String(liveTestGateResult.clientSecretsAllowed)}</b></p>\n              <h3>Vor Live-Test erforderlich</h3>\n              <ul>{liveTestGateResult.requiredBeforeLiveTest?.map((item: string) => <li key={item}>{item}</li>)}</ul>\n              <h3>Aktuelle Blocker</h3>\n              <ul>{liveTestGateResult.blockedReasons?.map((item: string) => <li key={item}>{item}</li>)}</ul>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{liveTestGateResult.nextSafeStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-live-test-gate.ts','frontend/app/api/cmt/master/secure/live-test/gate/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Manueller Live-Test-Schalter','runLiveTestGate','liveTestGateResult','Live-Test-Gate pruefen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-32 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-32.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp32:verify'] = 'node scripts/v-mvp-agent-32.cjs';
pkg.scripts['agent:mvp32:verify'] = 'node scripts/v-mvp-agent-32.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp32:verify agent:mvp32:verify');
console.log('[OK] mvp-agent-32 applied');

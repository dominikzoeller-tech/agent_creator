const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const preflightLib = `export type SecureMasterLivePreflightResult = {
  ok: boolean;
  checkedAt: string;
  liveTestPrepared: true;
  canAttemptLiveProviderCall: boolean;
  providerCallAllowed: boolean;
  clientSecretsAllowed: false;
  serverSideSecretsRequired: true;
  env: {
    LIVE_TEST_ENABLED: boolean;
    PROVIDER_ENABLED: boolean;
    LIVE_MODEL_ENABLED: boolean;
    EXTERNAL_SHARING_ALLOWED: boolean;
    PROVIDER_API_KEY_PRESENT: boolean;
    PROVIDER_MODEL_PRESENT: boolean;
    PROVIDER_BASE_URL_PRESENT: boolean;
  };
  blockedReasons: string[];
  safeTestQuestion: string;
  nextStep: string;
};

export function createSecureMasterLivePreflightResult(): SecureMasterLivePreflightResult {
  const env = {
    LIVE_TEST_ENABLED: process.env.LIVE_TEST_ENABLED === 'true',
    PROVIDER_ENABLED: process.env.PROVIDER_ENABLED === 'true',
    LIVE_MODEL_ENABLED: process.env.LIVE_MODEL_ENABLED === 'true',
    EXTERNAL_SHARING_ALLOWED: process.env.EXTERNAL_SHARING_ALLOWED === 'true',
    PROVIDER_API_KEY_PRESENT: Boolean(process.env.PROVIDER_API_KEY),
    PROVIDER_MODEL_PRESENT: Boolean(process.env.PROVIDER_MODEL || process.env.MODEL_NAME),
    PROVIDER_BASE_URL_PRESENT: Boolean(process.env.PROVIDER_BASE_URL),
  };

  const blockedReasons: string[] = [];
  if (!env.LIVE_TEST_ENABLED) blockedReasons.push('LIVE_TEST_ENABLED ist nicht true.');
  if (!env.PROVIDER_ENABLED) blockedReasons.push('PROVIDER_ENABLED ist nicht true.');
  if (!env.LIVE_MODEL_ENABLED) blockedReasons.push('LIVE_MODEL_ENABLED ist nicht true.');
  if (!env.EXTERNAL_SHARING_ALLOWED) blockedReasons.push('EXTERNAL_SHARING_ALLOWED ist nicht true.');
  if (!env.PROVIDER_API_KEY_PRESENT) blockedReasons.push('PROVIDER_API_KEY fehlt serverseitig.');
  if (!env.PROVIDER_MODEL_PRESENT) blockedReasons.push('PROVIDER_MODEL oder MODEL_NAME fehlt.');

  const canAttemptLiveProviderCall = blockedReasons.length === 0;

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    liveTestPrepared: true,
    canAttemptLiveProviderCall,
    providerCallAllowed: canAttemptLiveProviderCall,
    clientSecretsAllowed: false,
    serverSideSecretsRequired: true,
    env,
    blockedReasons,
    safeTestQuestion: 'Antworte in einem Satz: Funktioniert dieser sichere Live-Test?',
    nextStep: canAttemptLiveProviderCall
      ? 'Alle ENV-Gates sind aktiv. Jetzt nur eine harmlose Testfrage verwenden und keinen internen Inhalt senden.'
      : 'ENV-Gates serverseitig setzen, wenn ein echter Live-Test bewusst freigegeben ist.',
  };
}
`;
write('frontend/lib/cmt-secure-master-live-preflight.ts', preflightLib);

const preflightRoute = `import { NextResponse } from 'next/server';
import { createSecureMasterLivePreflightResult } from '../../../../../../lib/cmt-secure-master-live-preflight';

export async function GET() {
  return NextResponse.json(createSecureMasterLivePreflightResult());
}
`;
write('frontend/app/api/cmt/master/secure/live-test/preflight/route.ts', preflightRoute);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [livePreflightResult, setLivePreflightResult]')) {
  page = page.replace(
    "const [liveProviderTestResult, setLiveProviderTestResult] = useState<any | null>(null);",
    "const [liveProviderTestResult, setLiveProviderTestResult] = useState<any | null>(null);\n  const [livePreflightResult, setLivePreflightResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runLivePreflight')) {
  page = page.replace(
    "async function runLiveProviderTest() {",
    "async function runLivePreflight() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/live-test/preflight');\n      setLivePreflightResult(await response.json());\n    } catch (error) {\n      setLivePreflightResult({ ok: false, error: 'live_preflight_failed' });\n    }\n  }\n\n  async function runLiveProviderTest() {"
  );
}

if (!page.includes('livePreflightResult,')) {
  page = page.replace(
    "liveProviderTestResult,",
    "liveProviderTestResult, livePreflightResult,"
  );
}

if (!page.includes('Live-Test-Preflight')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Provider-Test vorbereitet</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Test-Preflight</h2>\n          <p style={{ color: '#fecaca' }}>Prueft, ob der echte Live-Test serverseitig freigegeben waere. Es werden keine Secrets angezeigt.</p>\n          <button onClick={runLivePreflight} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Preflight pruefen</button>\n          {livePreflightResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Live-Test vorbereitet: <b>{String(livePreflightResult.liveTestPrepared)}</b></p>\n              <p>Live-Call moeglich: <b>{String(livePreflightResult.canAttemptLiveProviderCall)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(livePreflightResult.providerCallAllowed)}</b></p>\n              <p>Client-Secrets erlaubt: <b>{String(livePreflightResult.clientSecretsAllowed)}</b></p>\n              <p>API-Key serverseitig vorhanden: <b>{String(livePreflightResult.env?.PROVIDER_API_KEY_PRESENT)}</b></p>\n              <p>Modell vorhanden: <b>{String(livePreflightResult.env?.PROVIDER_MODEL_PRESENT)}</b></p>\n              {livePreflightResult.blockedReasons?.length > 0 && <ul>{livePreflightResult.blockedReasons.map((item: string) => <li key={item}>{item}</li>)}</ul>}\n              <p style={{ color: '#bbf7d0' }}>Sichere Testfrage: {livePreflightResult.safeTestQuestion}</p>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{livePreflightResult.nextStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Provider-Test vorbereitet</h2>"
  );
}

write(pageRel, page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-live-preflight.ts','frontend/app/api/cmt/master/secure/live-test/preflight/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Live-Test-Preflight','runLivePreflight','livePreflightResult','Live-Preflight pruefen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] live-test-2 verify passed');process.exit(ok?0:1);`;
write('scripts/v-live-test-2.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['live2:verify'] = 'node scripts/v-live-test-2.cjs';
pkg.scripts['agent:live2:verify'] = 'node scripts/v-live-test-2.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts live2:verify agent:live2:verify');
console.log('[OK] live-test-2 applied');

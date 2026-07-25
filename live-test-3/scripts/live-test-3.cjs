const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

write('.env.live-test.example', `# Secure Master Agent - Live Test ENV Example
# DO NOT COMMIT REAL SECRETS.
# Copy manually to .env.local only when you intentionally run a real live test.

LIVE_TEST_ENABLED=false
PROVIDER_ENABLED=false
LIVE_MODEL_ENABLED=false
EXTERNAL_SHARING_ALLOWED=false

PROVIDER_NAME=openai-compatible
PROVIDER_MODEL=replace_with_model_name
PROVIDER_BASE_URL=https://api.openai.com/v1/chat/completions
PROVIDER_API_KEY=replace_later_do_not_commit

PROVIDER_MAX_TOKENS=300
PROVIDER_TIMEOUT_MS=30000
PROVIDER_DRY_RUN_ONLY=true
`);

write('docs/secure-master-live-test-runbook.md', `# Secure Master Agent Live Test Runbook

## Status

The live-test path is prepared, but real provider calls must remain blocked until a conscious manual test.

## Before the first real call

1. Build must be green.
2. The agent page must load: /cmt/master/secure/agent
3. Secret/Git preflight must be green.
4. Budget/token preflight must be green.
5. Use only a harmless test question.
6. Do not send internal, customer, personal, confidential, or secret data.
7. Provider key must be server-side only in .env.local.
8. No provider key may appear in browser, localStorage, Git, logs, screenshots, or exported JSON.

## Manual .env.local setup

Copy values from .env.live-test.example to .env.local and then intentionally change only these fields for a real test:

LIVE_TEST_ENABLED=true
PROVIDER_ENABLED=true
LIVE_MODEL_ENABLED=true
EXTERNAL_SHARING_ALLOWED=true
PROVIDER_MODEL=<your model>
PROVIDER_API_KEY=<your server-side key>

Keep PROVIDER_DRY_RUN_ONLY=true until the final conscious test moment.

## Safe first test question

Antworte in einem Satz: Funktioniert dieser sichere Live-Test?

## After the test

Immediately set the live gates back to false unless you intentionally continue testing.
`);

const runbookLib = `export type SecureMasterLiveTestRunbook = {
  runbookPrepared: true;
  envExampleFile: '.env.live-test.example';
  docsFile: 'docs/secure-master-live-test-runbook.md';
  providerCallAllowedByThisPatch: false;
  clientSecretsAllowed: false;
  requiredManualSteps: string[];
  safeFirstQuestion: string;
  rollbackInstruction: string;
};

export const secureMasterLiveTestRunbook: SecureMasterLiveTestRunbook = {
  runbookPrepared: true,
  envExampleFile: '.env.live-test.example',
  docsFile: 'docs/secure-master-live-test-runbook.md',
  providerCallAllowedByThisPatch: false,
  clientSecretsAllowed: false,
  requiredManualSteps: [
    'npm run build muss gruen sein',
    'Secret/Git-Preflight pruefen',
    'Budget-Preflight pruefen',
    '.env.live-test.example manuell nach .env.local uebertragen',
    'serverseitigen PROVIDER_API_KEY setzen',
    'nur harmlose Testfrage verwenden',
    'nach Test Gates wieder deaktivieren',
  ],
  safeFirstQuestion: 'Antworte in einem Satz: Funktioniert dieser sichere Live-Test?',
  rollbackInstruction: 'Nach dem Test LIVE_TEST_ENABLED, PROVIDER_ENABLED, LIVE_MODEL_ENABLED und EXTERNAL_SHARING_ALLOWED wieder auf false setzen.',
};
`;
write('frontend/lib/cmt-secure-master-live-test-runbook.ts', runbookLib);

const route = `import { NextResponse } from 'next/server';
import { secureMasterLiveTestRunbook } from '../../../../../../lib/cmt-secure-master-live-test-runbook';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...secureMasterLiveTestRunbook,
  });
}
`;
write('frontend/app/api/cmt/master/secure/live-test/runbook/route.ts', route);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [liveRunbookResult, setLiveRunbookResult]')) {
  page = page.replace(
    "const [livePreflightResult, setLivePreflightResult] = useState<any | null>(null);",
    "const [livePreflightResult, setLivePreflightResult] = useState<any | null>(null);\n  const [liveRunbookResult, setLiveRunbookResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function loadLiveRunbook')) {
  page = page.replace(
    "async function runLivePreflight() {",
    "async function loadLiveRunbook() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/live-test/runbook');\n      setLiveRunbookResult(await response.json());\n    } catch (error) {\n      setLiveRunbookResult({ ok: false, error: 'live_runbook_failed' });\n    }\n  }\n\n  async function runLivePreflight() {"
  );
}

if (!page.includes('liveRunbookResult,')) {
  page = page.replace(
    "livePreflightResult,",
    "livePreflightResult, liveRunbookResult,"
  );
}

if (!page.includes('Live-Test-Runbook')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Test-Preflight</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Test-Runbook</h2>\n          <p style={{ color: '#fecaca' }}>Runbook und ENV-Beispiel fuer den ersten echten Live-Test. Dieser Block aktiviert keinen Provider-Call.</p>\n          <button onClick={loadLiveRunbook} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Test-Runbook laden</button>\n          {liveRunbookResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>Runbook vorbereitet: <b>{String(liveRunbookResult.runbookPrepared)}</b></p>\n              <p>ENV Beispiel: <b>{liveRunbookResult.envExampleFile}</b></p>\n              <p>Docs: <b>{liveRunbookResult.docsFile}</b></p>\n              <p>Provider-Call durch diesen Patch erlaubt: <b>{String(liveRunbookResult.providerCallAllowedByThisPatch)}</b></p>\n              <p>Client-Secrets erlaubt: <b>{String(liveRunbookResult.clientSecretsAllowed)}</b></p>\n              <h3>Manuelle Schritte</h3>\n              <ul>{liveRunbookResult.requiredManualSteps?.map((item: string) => <li key={item}>{item}</li>)}</ul>\n              <p style={{ color: '#bbf7d0' }}>Sichere erste Frage: {liveRunbookResult.safeFirstQuestion}</p>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{liveRunbookResult.rollbackInstruction}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Test-Preflight</h2>"
  );
}

write(pageRel, page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['.env.live-test.example','docs/secure-master-live-test-runbook.md','frontend/lib/cmt-secure-master-live-test-runbook.ts','frontend/app/api/cmt/master/secure/live-test/runbook/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Live-Test-Runbook','loadLiveRunbook','liveRunbookResult','Live-Test-Runbook laden']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] live-test-3 verify passed');process.exit(ok?0:1);`;
write('scripts/v-live-test-3.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['live3:verify'] = 'node scripts/v-live-test-3.cjs';
pkg.scripts['agent:live3:verify'] = 'node scripts/v-live-test-3.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts live3:verify agent:live3:verify');
console.log('[OK] live-test-3 applied');

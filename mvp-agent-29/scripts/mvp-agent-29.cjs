const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const adapterLib = `export type SecureMasterServerProviderAdapterDisabled = {
  adapterPrepared: true;
  adapterEnabled: false;
  dispatchAllowed: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  externalSharingAllowed: false;
  secretsAccepted: false;
  endpointPath: '/api/cmt/master/secure/provider/adapter-disabled';
  blockedReason: string;
  nextSafeStep: string;
};

export const secureMasterServerProviderAdapterDisabled: SecureMasterServerProviderAdapterDisabled = {
  adapterPrepared: true,
  adapterEnabled: false,
  dispatchAllowed: false,
  providerCallAllowed: false,
  liveModelEnabled: false,
  externalSharingAllowed: false,
  secretsAccepted: false,
  endpointPath: '/api/cmt/master/secure/provider/adapter-disabled',
  blockedReason: 'Serverseitiger Provider-Adapter ist vorbereitet, aber hart deaktiviert. Kein Dispatch, kein Provider-Call, keine Secrets.',
  nextSafeStep: 'Als naechstes technische Secret/Git-Preflight-Pruefung vorbereiten. Danach Budget-/Token-Limit.',
};

export function createDisabledProviderAdapterResponse(inputPreview: string, approvalDecision: string) {
  return {
    ok: true,
    adapterPrepared: true,
    adapterEnabled: false,
    dispatchAllowed: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    requestPreview: {
      inputPreview: inputPreview.slice(0, 240),
      approvalDecision,
    },
    responseEnvelope: {
      status: 'adapter_disabled',
      message: 'Provider-Adapter-Codepfad erreicht, aber sicher blockiert. Kein Provider wurde aufgerufen.',
    },
    blockedReason: secureMasterServerProviderAdapterDisabled.blockedReason,
    nextSafeStep: secureMasterServerProviderAdapterDisabled.nextSafeStep,
  };
}
`;
write('frontend/lib/cmt-secure-master-server-provider-adapter-disabled.ts', adapterLib);

const route = `import { NextResponse } from 'next/server';
import { createDisabledProviderAdapterResponse } from '../../../../../../lib/cmt-secure-master-server-provider-adapter-disabled';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const inputPreview = typeof body?.inputPreview === 'string' ? body.inputPreview : '';
  const approvalDecision = typeof body?.approvalDecision === 'string' ? body.approvalDecision : 'local_only';

  return NextResponse.json(createDisabledProviderAdapterResponse(inputPreview, approvalDecision), { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    adapterPrepared: true,
    adapterEnabled: false,
    dispatchAllowed: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    message: 'Secure Master provider adapter endpoint is prepared but disabled for real provider calls.',
  });
}
`;
write('frontend/app/api/cmt/master/secure/provider/adapter-disabled/route.ts', route);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-server-provider-adapter-disabled')) {
  page = page.replace(
    "import { createSecureMasterProviderAuditEnvelope } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';",
    "import { createSecureMasterProviderAuditEnvelope } from '../../../../../lib/cmt-secure-master-provider-audit-envelope';\nimport { secureMasterServerProviderAdapterDisabled } from '../../../../../lib/cmt-secure-master-server-provider-adapter-disabled';"
  );
}

if (!page.includes('const [serverAdapterDisabledResult, setServerAdapterDisabledResult]')) {
  page = page.replace(
    "const [providerAuditHistory, setProviderAuditHistory] = useState<SecureMasterProviderAuditHistoryItem[]>([]);",
    "const [providerAuditHistory, setProviderAuditHistory] = useState<SecureMasterProviderAuditHistoryItem[]>([]);\n  const [serverAdapterDisabledResult, setServerAdapterDisabledResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runServerAdapterDisabled')) {
  page = page.replace(
    "function createProviderAuditEnvelope() {",
    "async function runServerAdapterDisabled() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/provider/adapter-disabled', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ inputPreview: input, approvalDecision: approval }),\n      });\n      setServerAdapterDisabledResult(await response.json());\n    } catch (error) {\n      setServerAdapterDisabledResult({ ok: false, error: 'server_adapter_disabled_failed' });\n    }\n  }\n\n  function createProviderAuditEnvelope() {"
  );
}

if (!page.includes('serverAdapterDisabled: secureMasterServerProviderAdapterDisabled')) {
  page = page.replace(
    "serverDryRunPrepared: secureMasterServerProviderDryRunContract, serverDryRunResult, providerAuditEnvelope,",
    "serverDryRunPrepared: secureMasterServerProviderDryRunContract, serverDryRunResult, serverAdapterDisabled: secureMasterServerProviderAdapterDisabled, serverAdapterDisabledResult, providerAuditEnvelope,"
  );
}

if (!page.includes('Server-Provider-Adapter deaktiviert')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #38bdf8', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n          <h2>Server-Provider-Adapter deaktiviert</h2>\n          <p style={{ color: '#cbd5e1' }}>Serverseitiger Adapter-Codepfad ist vorbereitet, bleibt aber hart deaktiviert.</p>\n          <p>Endpoint: <b>{secureMasterServerProviderAdapterDisabled.endpointPath}</b></p>\n          <p>Adapter aktiv: <b>{String(secureMasterServerProviderAdapterDisabled.adapterEnabled)}</b></p>\n          <p>Dispatch erlaubt: <b>{String(secureMasterServerProviderAdapterDisabled.dispatchAllowed)}</b></p>\n          <p>Provider-Call erlaubt: <b>{String(secureMasterServerProviderAdapterDisabled.providerCallAllowed)}</b></p>\n          <p>Secrets akzeptiert: <b>{String(secureMasterServerProviderAdapterDisabled.secretsAccepted)}</b></p>\n          <button onClick={runServerAdapterDisabled} style={{ border: '1px solid #22d3ee', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Deaktivierten Adapter testen</button>\n          {serverAdapterDisabledResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>OK: <b>{String(serverAdapterDisabledResult.ok)}</b></p>\n              <p>Adapter aktiv: <b>{String(serverAdapterDisabledResult.adapterEnabled)}</b></p>\n              <p>Dispatch erlaubt: <b>{String(serverAdapterDisabledResult.dispatchAllowed)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(serverAdapterDisabledResult.providerCallAllowed)}</b></p>\n              <p>{serverAdapterDisabledResult?.responseEnvelope?.message ?? serverAdapterDisabledResult?.message ?? 'Keine Antwort.'}</p>\n            </div>\n          )}\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterServerProviderAdapterDisabled.nextSafeStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-server-provider-adapter-disabled.ts','frontend/app/api/cmt/master/secure/provider/adapter-disabled/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Server-Provider-Adapter deaktiviert','runServerAdapterDisabled','serverAdapterDisabledResult','secureMasterServerProviderAdapterDisabled','serverAdapterDisabled: secureMasterServerProviderAdapterDisabled']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-29 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-29.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp29:verify'] = 'node scripts/v-mvp-agent-29.cjs';
pkg.scripts['agent:mvp29:verify'] = 'node scripts/v-mvp-agent-29.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp29:verify agent:mvp29:verify');
console.log('[OK] mvp-agent-29 applied');

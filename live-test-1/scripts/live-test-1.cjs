const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const liveLib = `export type SecureMasterLiveProviderGate = {
  liveTestEnabled: boolean;
  providerEnabled: boolean;
  liveModelEnabled: boolean;
  externalSharingAllowed: boolean;
  providerName: string;
  modelName: string;
  hasApiKey: boolean;
  providerCallAllowed: boolean;
  blockedReasons: string[];
};

export type SecureMasterLiveProviderResponse = {
  ok: boolean;
  liveProviderPathPrepared: true;
  providerCallAttempted: boolean;
  providerCallAllowed: boolean;
  gate: SecureMasterLiveProviderGate;
  answer?: string;
  blockedReasons?: string[];
  error?: string;
};

const sensitiveTerms = [
  'kundendaten', 'kunde ', 'intern', 'vertraulich', 'geheim', 'passwort', 'api key', 'token', 'iban', 'personenbezogen', 'rechnung', 'vertrag', 'mitarbeiter'
];

export function containsSensitiveTerms(input: string) {
  const value = input.toLowerCase();
  return sensitiveTerms.filter((term) => value.includes(term));
}

export function createLiveProviderGate(input: string): SecureMasterLiveProviderGate {
  const blockedReasons: string[] = [];
  const liveTestEnabled = process.env.LIVE_TEST_ENABLED === 'true';
  const providerEnabled = process.env.PROVIDER_ENABLED === 'true';
  const liveModelEnabled = process.env.LIVE_MODEL_ENABLED === 'true';
  const externalSharingAllowed = process.env.EXTERNAL_SHARING_ALLOWED === 'true';
  const providerName = process.env.PROVIDER_NAME || 'none';
  const modelName = process.env.PROVIDER_MODEL || process.env.MODEL_NAME || 'none';
  const hasApiKey = Boolean(process.env.PROVIDER_API_KEY);
  const sensitiveMatches = containsSensitiveTerms(input);

  if (!liveTestEnabled) blockedReasons.push('LIVE_TEST_ENABLED ist nicht true.');
  if (!providerEnabled) blockedReasons.push('PROVIDER_ENABLED ist nicht true.');
  if (!liveModelEnabled) blockedReasons.push('LIVE_MODEL_ENABLED ist nicht true.');
  if (!externalSharingAllowed) blockedReasons.push('EXTERNAL_SHARING_ALLOWED ist nicht true.');
  if (!hasApiKey) blockedReasons.push('PROVIDER_API_KEY fehlt serverseitig.');
  if (!modelName || modelName === 'none') blockedReasons.push('PROVIDER_MODEL/MODEL_NAME fehlt.');
  if (sensitiveMatches.length > 0) blockedReasons.push('Testfrage enthaelt blockierte sensible Begriffe: ' + sensitiveMatches.join(', '));
  if (input.trim().length === 0) blockedReasons.push('Testfrage fehlt.');
  if (input.length > 500) blockedReasons.push('Testfrage ist zu lang fuer den ersten Live-Test.');

  return {
    liveTestEnabled,
    providerEnabled,
    liveModelEnabled,
    externalSharingAllowed,
    providerName,
    modelName,
    hasApiKey,
    providerCallAllowed: blockedReasons.length === 0,
    blockedReasons,
  };
}

export function buildSafeLiveTestPrompt(input: string) {
  return [
    { role: 'system', content: 'Du bist ein sicherer Test-Assistent. Antworte kurz. Verarbeite keine internen, personenbezogenen oder geheimen Daten.' },
    { role: 'user', content: input.slice(0, 500) },
  ];
}
`;
write('frontend/lib/cmt-secure-master-live-provider-gate.ts', liveLib);

const route = `import { NextResponse } from 'next/server';
import { buildSafeLiveTestPrompt, createLiveProviderGate, type SecureMasterLiveProviderResponse } from '../../../../../../../lib/cmt-secure-master-live-provider-gate';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const input = typeof body?.input === 'string' ? body.input : '';
  const gate = createLiveProviderGate(input);

  if (!gate.providerCallAllowed) {
    const blocked: SecureMasterLiveProviderResponse = {
      ok: false,
      liveProviderPathPrepared: true,
      providerCallAttempted: false,
      providerCallAllowed: false,
      gate,
      blockedReasons: gate.blockedReasons,
    };
    return NextResponse.json(blocked, { status: 200 });
  }

  const baseUrl = process.env.PROVIDER_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.PROVIDER_API_KEY || '';
  const model = gate.modelName;
  const maxTokens = Number(process.env.PROVIDER_MAX_TOKENS || '300');
  const timeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || '30000');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: buildSafeLiveTestPrompt(input),
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    const data: any = await response.json().catch(() => ({}));
    const answer = data?.choices?.[0]?.message?.content || data?.output_text || '';

    const result: SecureMasterLiveProviderResponse = {
      ok: response.ok,
      liveProviderPathPrepared: true,
      providerCallAttempted: true,
      providerCallAllowed: true,
      gate,
      answer: answer || 'Provider antwortete ohne auslesbaren Inhalt.',
      error: response.ok ? undefined : 'provider_http_' + response.status,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const result: SecureMasterLiveProviderResponse = {
      ok: false,
      liveProviderPathPrepared: true,
      providerCallAttempted: true,
      providerCallAllowed: true,
      gate,
      error: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_call_failed',
    };
    return NextResponse.json(result, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const gate = createLiveProviderGate('');
  return NextResponse.json({
    ok: true,
    liveProviderPathPrepared: true,
    providerCallAllowed: false,
    currentGate: gate,
    message: 'POST mit harmloser Testfrage erforderlich. Provider-Call nur bei expliziten ENV-Gates.',
  });
}
`;
write('frontend/app/api/cmt/master/secure/live-test/provider/route.ts', route);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [liveProviderTestResult, setLiveProviderTestResult]')) {
  page = page.replace(
    "const [liveTestGateResult, setLiveTestGateResult] = useState<any | null>(null);",
    "const [liveTestGateResult, setLiveTestGateResult] = useState<any | null>(null);\n  const [liveProviderTestResult, setLiveProviderTestResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runLiveProviderTest')) {
  page = page.replace(
    "async function runLiveTestGate() {",
    "async function runLiveProviderTest() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/live-test/provider', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ input }),\n      });\n      setLiveProviderTestResult(await response.json());\n    } catch (error) {\n      setLiveProviderTestResult({ ok: false, error: 'live_provider_test_failed' });\n    }\n  }\n\n  async function runLiveTestGate() {"
  );
}

if (!page.includes('liveProviderTestResult,')) {
  page = page.replace(
    "liveTestGateResult,",
    "liveTestGateResult, liveProviderTestResult,"
  );
}

if (!page.includes('Live-Provider-Test vorbereitet')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #ef4444', borderRadius: 18, background: '#1f1111', padding: 20 }}>\n          <h2>Live-Provider-Test vorbereitet</h2>\n          <p style={{ color: '#fecaca' }}>Dies ist der erste echte serverseitige Provider-Testpfad. Er bleibt blockiert, solange die ENV-Gates nicht explizit gesetzt sind.</p>\n          <p>Nur harmlose Testfragen verwenden. Keine internen, personenbezogenen oder geheimen Daten senden.</p>\n          <button onClick={runLiveProviderTest} style={{ border: '1px solid #ef4444', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Live-Provider-Test ausfuehren</button>\n          {liveProviderTestResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>OK: <b>{String(liveProviderTestResult.ok)}</b></p>\n              <p>Provider-Call versucht: <b>{String(liveProviderTestResult.providerCallAttempted)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(liveProviderTestResult.providerCallAllowed)}</b></p>\n              <p>Provider: <b>{liveProviderTestResult.gate?.providerName ?? 'none'}</b> | Modell: <b>{liveProviderTestResult.gate?.modelName ?? 'none'}</b></p>\n              {liveProviderTestResult.blockedReasons?.length > 0 && <ul>{liveProviderTestResult.blockedReasons.map((item: string) => <li key={item}>{item}</li>)}</ul>}\n              {liveProviderTestResult.answer && <p style={{ color: '#bbf7d0' }}>{liveProviderTestResult.answer}</p>}\n              {liveProviderTestResult.error && <p style={{ color: '#fecaca' }}>{liveProviderTestResult.error}</p>}\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-live-provider-gate.ts','frontend/app/api/cmt/master/secure/live-test/provider/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Live-Provider-Test vorbereitet','runLiveProviderTest','liveProviderTestResult','Live-Provider-Test ausfuehren']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] live-test-1 verify passed');process.exit(ok?0:1);`;
write('scripts/v-live-test-1.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['live1:verify'] = 'node scripts/v-live-test-1.cjs';
pkg.scripts['agent:live1:verify'] = 'node scripts/v-live-test-1.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts live1:verify agent:live1:verify');
console.log('[OK] live-test-1 applied');

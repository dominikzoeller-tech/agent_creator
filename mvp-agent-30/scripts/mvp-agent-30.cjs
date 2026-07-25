const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const preflightLib = `export type SecureMasterSecretPreflightResult = {
  ok: boolean;
  checkedAt: string;
  realSecretsRead: false;
  providerCallAllowed: false;
  liveModelEnabled: false;
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreCoversEnv: boolean;
  gitIgnoreCoversKeys: boolean;
  requiredBeforeLive: string[];
  warnings: string[];
  nextSafeStep: string;
};

export function createSecureMasterSecretPreflightResult(params: {
  envExampleExists: boolean;
  gitIgnoreExists: boolean;
  gitIgnoreText: string;
}): SecureMasterSecretPreflightResult {
  const gitIgnoreText = params.gitIgnoreText.toLowerCase();
  const gitIgnoreCoversEnv = gitIgnoreText.includes('.env') || gitIgnoreText.includes('.env.*');
  const gitIgnoreCoversKeys = gitIgnoreText.includes('*.key') || gitIgnoreText.includes('secret') || gitIgnoreText.includes('*secret*');
  const warnings: string[] = [];

  if (!params.envExampleExists) warnings.push('.env.example fehlt oder ist nicht lesbar.');
  if (!params.gitIgnoreExists) warnings.push('.gitignore fehlt oder ist nicht lesbar.');
  if (!gitIgnoreCoversEnv) warnings.push('.gitignore deckt .env-Dateien noch nicht eindeutig ab.');
  if (!gitIgnoreCoversKeys) warnings.push('.gitignore deckt Key-/Secret-Dateien noch nicht eindeutig ab.');

  return {
    ok: warnings.length === 0,
    checkedAt: new Date().toISOString(),
    realSecretsRead: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    envExampleExists: params.envExampleExists,
    gitIgnoreExists: params.gitIgnoreExists,
    gitIgnoreCoversEnv,
    gitIgnoreCoversKeys,
    requiredBeforeLive: [
      '.env.example ohne echte Werte vorhanden',
      '.gitignore blockiert .env und Secret-Dateien',
      'echte API-Keys nur serverseitig und nie im Client',
      'keine echten Secrets im Repo',
      'Provider bleibt deaktiviert bis manueller Live-Test-Schalter aktiv ist',
    ],
    warnings,
    nextSafeStep: warnings.length === 0
      ? 'Secret/Git-Preflight ist lokal gruener. Als naechstes Budget-/Token-Limit vorbereiten.'
      : 'Warnungen beheben, bevor ein Live-Test-Schalter vorbereitet wird.',
  };
}
`;
write('frontend/lib/cmt-secure-master-secret-preflight-check.ts', preflightLib);

const route = `import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createSecureMasterSecretPreflightResult } from '../../../../../../lib/cmt-secure-master-secret-preflight-check';

export async function GET() {
  const root = process.cwd();
  const envExamplePath = join(root, '..', '.env.example');
  const gitIgnorePath = join(root, '..', '.gitignore');

  const envExampleExists = existsSync(envExamplePath);
  const gitIgnoreExists = existsSync(gitIgnorePath);

  let gitIgnoreText = '';
  if (gitIgnoreExists) {
    try {
      gitIgnoreText = await readFile(gitIgnorePath, 'utf8');
    } catch {
      gitIgnoreText = '';
    }
  }

  return NextResponse.json(createSecureMasterSecretPreflightResult({
    envExampleExists,
    gitIgnoreExists,
    gitIgnoreText,
  }));
}
`;
write('frontend/app/api/cmt/master/secure/secret/preflight/route.ts', route);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [secretPreflightResult, setSecretPreflightResult]')) {
  page = page.replace(
    "const [serverAdapterDisabledResult, setServerAdapterDisabledResult] = useState<any | null>(null);",
    "const [serverAdapterDisabledResult, setServerAdapterDisabledResult] = useState<any | null>(null);\n  const [secretPreflightResult, setSecretPreflightResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runSecretPreflight')) {
  page = page.replace(
    "async function runServerAdapterDisabled() {",
    "async function runSecretPreflight() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/secret/preflight');\n      setSecretPreflightResult(await response.json());\n    } catch (error) {\n      setSecretPreflightResult({ ok: false, error: 'secret_preflight_failed' });\n    }\n  }\n\n  async function runServerAdapterDisabled() {"
  );
}

if (!page.includes('secretPreflightResult,')) {
  page = page.replace(
    "serverAdapterDisabled: secureMasterServerProviderAdapterDisabled, serverAdapterDisabledResult,",
    "serverAdapterDisabled: secureMasterServerProviderAdapterDisabled, serverAdapterDisabledResult, secretPreflightResult,"
  );
}

if (!page.includes('Secret/Git-Preflight technisch')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #f97316', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Secret/Git-Preflight technisch</h2>\n          <p style={{ color: '#cbd5e1' }}>Prueft serverseitig `.env.example` und `.gitignore`, liest aber keine echten Secrets.</p>\n          <button onClick={runSecretPreflight} style={{ border: '1px solid #f97316', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Secret-Preflight pruefen</button>\n          {secretPreflightResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>OK: <b>{String(secretPreflightResult.ok)}</b></p>\n              <p>Echte Secrets gelesen: <b>{String(secretPreflightResult.realSecretsRead)}</b></p>\n              <p>.env.example vorhanden: <b>{String(secretPreflightResult.envExampleExists)}</b></p>\n              <p>.gitignore vorhanden: <b>{String(secretPreflightResult.gitIgnoreExists)}</b></p>\n              <p>.env abgedeckt: <b>{String(secretPreflightResult.gitIgnoreCoversEnv)}</b></p>\n              <p>Key/Secret-Dateien abgedeckt: <b>{String(secretPreflightResult.gitIgnoreCoversKeys)}</b></p>\n              {secretPreflightResult.warnings?.length > 0 && <ul>{secretPreflightResult.warnings.map((item: string) => <li key={item}>{item}</li>)}</ul>}\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{secretPreflightResult.nextSafeStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-secret-preflight-check.ts','frontend/app/api/cmt/master/secure/secret/preflight/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Secret/Git-Preflight technisch','runSecretPreflight','secretPreflightResult','Secret-Preflight pruefen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-30 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-30.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp30:verify'] = 'node scripts/v-mvp-agent-30.cjs';
pkg.scripts['agent:mvp30:verify'] = 'node scripts/v-mvp-agent-30.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp30:verify agent:mvp30:verify');
console.log('[OK] mvp-agent-30 applied');

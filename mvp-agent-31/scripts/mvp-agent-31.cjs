const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const budgetLib = `export type SecureMasterBudgetPreflightResult = {
  ok: boolean;
  checkedAt: string;
  providerCallAllowed: false;
  liveModelEnabled: false;
  budgetLimitPrepared: true;
  maxTokensPerRequest: number;
  maxRequestsPerSession: number;
  maxEstimatedCostPerSessionEur: number;
  timeoutMs: number;
  hardStopEnabled: true;
  warnings: string[];
  requiredBeforeLive: string[];
  nextSafeStep: string;
};

export function createSecureMasterBudgetPreflightResult(): SecureMasterBudgetPreflightResult {
  const maxTokensPerRequest = 1000;
  const maxRequestsPerSession = 10;
  const maxEstimatedCostPerSessionEur = 1;
  const timeoutMs = 30000;
  const warnings: string[] = [];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    providerCallAllowed: false,
    liveModelEnabled: false,
    budgetLimitPrepared: true,
    maxTokensPerRequest,
    maxRequestsPerSession,
    maxEstimatedCostPerSessionEur,
    timeoutMs,
    hardStopEnabled: true,
    warnings,
    requiredBeforeLive: [
      'maxTokensPerRequest muss gesetzt sein',
      'maxRequestsPerSession muss gesetzt sein',
      'maxEstimatedCostPerSessionEur muss gesetzt sein',
      'timeoutMs muss gesetzt sein',
      'Hard-Stop muss aktiv sein',
      'Audit-Log muss jeden echten Provider-Call protokollieren',
    ],
    nextSafeStep: 'Budget-/Token-Limit ist vorbereitet. Als naechstes manuellen Live-Test-Schalter bauen, aber standardmaessig deaktiviert lassen.',
  };
}
`;
write('frontend/lib/cmt-secure-master-budget-preflight.ts', budgetLib);

const route = `import { NextResponse } from 'next/server';
import { createSecureMasterBudgetPreflightResult } from '../../../../../../lib/cmt-secure-master-budget-preflight';

export async function GET() {
  return NextResponse.json(createSecureMasterBudgetPreflightResult());
}
`;
write('frontend/app/api/cmt/master/secure/budget/preflight/route.ts', route);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [budgetPreflightResult, setBudgetPreflightResult]')) {
  page = page.replace(
    "const [secretPreflightResult, setSecretPreflightResult] = useState<any | null>(null);",
    "const [secretPreflightResult, setSecretPreflightResult] = useState<any | null>(null);\n  const [budgetPreflightResult, setBudgetPreflightResult] = useState<any | null>(null);"
  );
}

if (!page.includes('async function runBudgetPreflight')) {
  page = page.replace(
    "async function runSecretPreflight() {",
    "async function runBudgetPreflight() {\n    try {\n      const response = await fetch('/api/cmt/master/secure/budget/preflight');\n      setBudgetPreflightResult(await response.json());\n    } catch (error) {\n      setBudgetPreflightResult({ ok: false, error: 'budget_preflight_failed' });\n    }\n  }\n\n  async function runSecretPreflight() {"
  );
}

if (!page.includes('budgetPreflightResult,')) {
  page = page.replace(
    "secretPreflightResult,",
    "secretPreflightResult, budgetPreflightResult,"
  );
}

if (!page.includes('Budget-/Token-Limit technisch')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>\n          <h2>Budget-/Token-Limit technisch</h2>\n          <p style={{ color: '#cbd5e1' }}>Bereitet sichere Kosten- und Token-Grenzen fuer spaetere Live-KI vor. Kein Provider-Call.</p>\n          <button onClick={runBudgetPreflight} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 12px' }}>Budget-Preflight pruefen</button>\n          {budgetPreflightResult && (\n            <div style={{ marginTop: 12, border: '1px solid #334155', borderRadius: 12, background: '#020617', padding: 12 }}>\n              <p>OK: <b>{String(budgetPreflightResult.ok)}</b></p>\n              <p>Provider-Call erlaubt: <b>{String(budgetPreflightResult.providerCallAllowed)}</b></p>\n              <p>Live-Modell aktiv: <b>{String(budgetPreflightResult.liveModelEnabled)}</b></p>\n              <p>Max Tokens / Request: <b>{budgetPreflightResult.maxTokensPerRequest}</b></p>\n              <p>Max Requests / Session: <b>{budgetPreflightResult.maxRequestsPerSession}</b></p>\n              <p>Max Kosten / Session EUR: <b>{budgetPreflightResult.maxEstimatedCostPerSessionEur}</b></p>\n              <p>Timeout ms: <b>{budgetPreflightResult.timeoutMs}</b></p>\n              <p>Hard-Stop aktiv: <b>{String(budgetPreflightResult.hardStopEnabled)}</b></p>\n              <h3>Vor Live erforderlich</h3>\n              <ul>{budgetPreflightResult.requiredBeforeLive?.map((item: string) => <li key={item}>{item}</li>)}</ul>\n              <p style={{ color: '#94a3b8', fontSize: 13 }}>{budgetPreflightResult.nextSafeStep}</p>\n            </div>\n          )}\n        </section>\n\n        <section style={{ border: '1px solid #fbbf24', borderRadius: 18, background: '#1c1917', padding: 20 }}>\n          <h2>Live-Readiness-Matrix</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-budget-preflight.ts','frontend/app/api/cmt/master/secure/budget/preflight/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Budget-/Token-Limit technisch','runBudgetPreflight','budgetPreflightResult','Budget-Preflight pruefen']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-31 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-31.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp31:verify'] = 'node scripts/v-mvp-agent-31.cjs';
pkg.scripts['agent:mvp31:verify'] = 'node scripts/v-mvp-agent-31.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp31:verify agent:mvp31:verify');
console.log('[OK] mvp-agent-31 applied');

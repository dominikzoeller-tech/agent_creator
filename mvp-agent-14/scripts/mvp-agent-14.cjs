const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const decisionLib = `export type SecureMasterRecommendation = 'local_answer' | 'committee' | 'provider_dry_run' | 'blocked';

export type SecureMasterDecisionSummary = {
  recommendation: SecureMasterRecommendation;
  title: string;
  reason: string;
  nextBestAction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  providerCallAllowed: false;
  dryRunOnly: true;
};

export function createSecureMasterDecisionSummary(params: {
  intent?: string;
  route?: string;
  privacyDecision?: string;
  approvalDecision?: string;
}): SecureMasterDecisionSummary {
  const intent = params.intent ?? 'general';
  const route = params.route ?? 'direct';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision ?? 'local_only';

  if (privacy === 'block_external' || approval === 'cancel') {
    return {
      recommendation: 'blocked',
      title: 'Blockiert / nur lokal behandeln',
      reason: 'Sensible Inhalte oder Abbruchentscheidung erkannt. Keine externe Weitergabe zulassen.',
      nextBestAction: 'Eingabe lokal prüfen, sensible Bestandteile markieren und keine Provider-Schicht verwenden.',
      riskLevel: 'critical',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'privacy_gate') {
    return {
      recommendation: 'blocked',
      title: 'Datenschutz-Gate aktiv',
      reason: 'Interne oder geschäftliche Daten erkannt. Externe Verarbeitung bleibt blockiert.',
      nextBestAction: 'Lokal antworten oder anonymisierte Variante vorbereiten, aber noch nicht senden.',
      riskLevel: 'high',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'tool_required') {
    return {
      recommendation: 'provider_dry_run',
      title: 'Tool oder Provider waere spaeter noetig',
      reason: 'Die Frage braucht wahrscheinlich aktuelle Daten, Internet oder ein externes Modell.',
      nextBestAction: 'Provider-Dry-Run nutzen, um den spaeteren Ablauf zu testen. Kein echter Call.',
      riskLevel: 'medium',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'committee' || intent === 'live_switch' || intent === 'improvement') {
    return {
      recommendation: 'committee',
      title: 'Gremium sinnvoll',
      reason: 'Die Frage betrifft Entscheidung, Risiko, Verbesserung oder Live-Schaltung.',
      nextBestAction: 'Gremiumsausgabe nutzen, lokale Tests fortsetzen und Live-KI noch nicht aktivieren.',
      riskLevel: 'medium',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  return {
    recommendation: 'local_answer',
    title: 'Lokale Antwort reicht vorerst',
    reason: 'Keine externe Datenquelle und kein Live-Modell erforderlich.',
    nextBestAction: 'Lokale Antwort nutzen, Verlauf speichern und bei Unsicherheit Gremium einschalten.',
    riskLevel: 'low',
    providerCallAllowed: false,
    dryRunOnly: true,
  };
}
`;
write('frontend/lib/cmt-secure-master-decision-summary.ts', decisionLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-decision-summary')) {
  page = page.replace(
    "import { SECURE_MASTER_DRY_RUN_HISTORY_KEY, createDryRunHistoryItem, type SecureMasterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-dry-run-history';",
    "import { SECURE_MASTER_DRY_RUN_HISTORY_KEY, createDryRunHistoryItem, type SecureMasterDryRunHistoryItem } from '../../../../../lib/cmt-secure-master-dry-run-history';\nimport { createSecureMasterDecisionSummary } from '../../../../../lib/cmt-secure-master-decision-summary';"
  );
}

if (!page.includes('const decisionSummary = current')) {
  page = page.replace(
    "function exportLogs() {",
    "const decisionSummary = current ? createSecureMasterDecisionSummary({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval }) : null;\n\n  function exportLogs() {"
  );
}

if (!page.includes('decisionSummary,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };"
  );
}

if (!page.includes('Agentenentscheidung')) {
  page = page.replace(
    "{current && (\n          <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>",
    "{current && decisionSummary && (\n          <section style={{ border: '1px solid #22d3ee', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n            <h2>Agentenentscheidung</h2>\n            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n              <span style={{ background: '#164e63', borderRadius: 999, padding: '6px 10px' }}>Empfehlung: {decisionSummary.recommendation}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Risiko: {decisionSummary.riskLevel}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Provider-Call: {String(decisionSummary.providerCallAllowed)}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Dry-Run only: {String(decisionSummary.dryRunOnly)}</span>\n            </div>\n            <h3>{decisionSummary.title}</h3>\n            <p>{decisionSummary.reason}</p>\n            <p style={{ color: '#94a3b8' }}>Nächste beste Aktion: {decisionSummary.nextBestAction}</p>\n          </section>\n        )}\n\n        {current && (\n          <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-decision-summary.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Agentenentscheidung','decisionSummary','createSecureMasterDecisionSummary','Nächste beste Aktion','Empfehlung:']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-14 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-14.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp14:verify'] = 'node scripts/v-mvp-agent-14.cjs';
pkg.scripts['agent:mvp14:verify'] = 'node scripts/v-mvp-agent-14.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp14:verify agent:mvp14:verify');
console.log('[OK] mvp-agent-14 applied');

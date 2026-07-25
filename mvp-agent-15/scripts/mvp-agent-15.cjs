const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const planLib = `export type SecureMasterActionPlan = {
  headline: string;
  summary: string;
  steps: string[];
  liveBoundary: string;
  providerCallAllowed: false;
  dryRunOnly: true;
};

export function createSecureMasterActionPlan(params: {
  intent?: string;
  route?: string;
  privacyDecision?: string;
  approvalDecision?: string;
  hasProviderDryRun?: boolean;
}): SecureMasterActionPlan {
  const intent = params.intent ?? 'general';
  const route = params.route ?? 'direct';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision ?? 'local_only';
  const hasDryRun = Boolean(params.hasProviderDryRun);

  if (privacy === 'block_external' || approval === 'cancel') {
    return {
      headline: 'Sicher stoppen und lokal bleiben',
      summary: 'Die Eingabe ist zu sensibel oder wurde abgebrochen. Keine externe Verarbeitung.',
      steps: ['Eingabe lokal pruefen', 'sensible Bestandteile markieren', 'keinen Provider-Dry-Run ausfuehren', 'bei Bedarf anonymisierte Version erstellen'],
      liveBoundary: 'Live-KI bleibt blockiert.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'privacy_gate') {
    return {
      headline: 'Datenschutz zuerst',
      summary: 'Interne oder geschaeftliche Daten erkannt. Der sichere Weg ist lokale Verarbeitung oder Anonymisierung.',
      steps: ['lokale Antwort bewerten', 'interne Details entfernen oder anonymisieren', 'Freigabeentscheidung local_only bevorzugen', 'erst spaeter anonymize_then_send pruefen'],
      liveBoundary: 'Keine externe Weitergabe ohne explizite Freigabe und Anonymisierung.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'tool_required') {
    return {
      headline: hasDryRun ? 'Dry-Run auswerten' : 'Provider-Dry-Run sinnvoll',
      summary: 'Die Frage braucht wahrscheinlich aktuelle Daten oder ein Modell. Aktuell darf nur simuliert werden.',
      steps: hasDryRun
        ? ['Dry-Run-Ergebnis pruefen', 'fehlende Datenquelle benennen', 'Provider-Gate noch nicht aktivieren', 'spaeter echten Adapter vorbereiten']
        : ['Provider-Dry-Run simulieren', 'fehlende Datenquelle dokumentieren', 'keinen echten Call erlauben', 'spaeter Adapter-Plan erstellen'],
      liveBoundary: 'Provider-Dry-Run ist erlaubt, echter Provider-Call nicht.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  if (route === 'committee' || intent === 'live_switch' || intent === 'improvement') {
    return {
      headline: 'Gremiumsausgabe nutzen',
      summary: 'Die Frage betrifft Entscheidung, Verbesserung, Risiko oder Live-Schaltung.',
      steps: ['Gremiumsargumente lesen', 'Risiken markieren', 'naechste konkrete Umsetzung waehlen', 'Live-KI erst nach stabilem Gate vorbereiten'],
      liveBoundary: 'Live-Schaltung jetzt noch nicht freigeben.',
      providerCallAllowed: false,
      dryRunOnly: true,
    };
  }

  return {
    headline: 'Lokal beantworten und protokollieren',
    summary: 'Die Frage kann lokal eingeordnet werden.',
    steps: ['lokale Antwort pruefen', 'Verlauf speichern', 'bei Unsicherheit Gremium nutzen', 'bei Toolbedarf Dry-Run testen'],
    liveBoundary: 'Keine externe Verarbeitung erforderlich.',
    providerCallAllowed: false,
    dryRunOnly: true,
  };
}
`;
write('frontend/lib/cmt-secure-master-action-plan.ts', planLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

// Add import after decision summary import if available.
if (!page.includes('cmt-secure-master-action-plan')) {
  if (page.includes("import { createSecureMasterDecisionSummary } from '../../../../../lib/cmt-secure-master-decision-summary';")) {
    page = page.replace(
      "import { createSecureMasterDecisionSummary } from '../../../../../lib/cmt-secure-master-decision-summary';",
      "import { createSecureMasterDecisionSummary } from '../../../../../lib/cmt-secure-master-decision-summary';\nimport { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';"
    );
  } else {
    page = page.replace(
      "import { useEffect, useState } from 'react';",
      "import { useEffect, useState } from 'react';\nimport { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';"
    );
  }
}

// Add computed actionPlan before exportLogs.
if (!page.includes('const actionPlan = current')) {
  page = page.replace(
    "function exportLogs() {",
    "const actionPlan = current ? createSecureMasterActionPlan({ intent: current.intent, route: current.route, privacyDecision: current.privacyDecision, approvalDecision: approval, hasProviderDryRun: Boolean(dryRunResult) }) : null;\n\n  function exportLogs() {"
  );
}

// Include actionPlan in export if payload exists.
if (!page.includes('actionPlan,')) {
  page = page.replace(
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };",
    "const payload = { exportedAt: new Date().toISOString(), approvalDecision: approval, decisionSummary, actionPlan, liveGate: secureMasterLiveGateCheck, providerDryRun: dryRunResult, dryRunHistory, logs };"
  );
}

// Insert Action Plan section before Local Answer section if not present.
if (!page.includes('Lokaler Aktionsplan')) {
  const marker = "{current && (\n          <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>";
  const insertion = "{current && actionPlan && (\n          <section style={{ border: '1px solid #22c55e', borderRadius: 18, background: '#0f172a', padding: 20 }}>\n            <h2>Lokaler Aktionsplan</h2>\n            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>\n              <span style={{ background: '#14532d', borderRadius: 999, padding: '6px 10px' }}>{actionPlan.headline}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Provider-Call: {String(actionPlan.providerCallAllowed)}</span>\n              <span style={{ background: '#1e293b', borderRadius: 999, padding: '6px 10px' }}>Dry-Run only: {String(actionPlan.dryRunOnly)}</span>\n            </div>\n            <p>{actionPlan.summary}</p>\n            <h3>Konkrete Schritte</h3>\n            <ul>{actionPlan.steps.map((step) => <li key={step}>{step}</li>)}</ul>\n            <p style={{ color: '#94a3b8' }}>Live-Grenze: {actionPlan.liveBoundary}</p>\n          </section>\n        )}\n\n        ";
  if (page.includes(marker)) {
    page = page.replace(marker, insertion + marker);
  } else {
    page = page.replace(
      "<section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Lokaler Verlauf</h2>",
      insertion + "<section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Lokaler Verlauf</h2>"
    );
  }
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-action-plan.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Lokaler Aktionsplan','actionPlan','createSecureMasterActionPlan','Konkrete Schritte','Live-Grenze']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-15 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-15.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp15:verify'] = 'node scripts/v-mvp-agent-15.cjs';
pkg.scripts['agent:mvp15:verify'] = 'node scripts/v-mvp-agent-15.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp15:verify agent:mvp15:verify');
console.log('[OK] mvp-agent-15 applied');

const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const decisionLib = `export type SecureMasterApprovalDecision = 'local_only' | 'anonymize_then_send' | 'cancel';

export type SecureMasterApprovalDecisionPreview = {
  decisionPrepared: true;
  allowedDecisions: SecureMasterApprovalDecision[];
  defaultDecision: SecureMasterApprovalDecision;
  externalSendStillBlocked: true;
  noProviderCall: true;
  explanations: Record<SecureMasterApprovalDecision, string>;
  nextStep: string;
};

export const secureMasterApprovalDecisionPreview: SecureMasterApprovalDecisionPreview = {
  decisionPrepared: true,
  allowedDecisions: ['local_only', 'anonymize_then_send', 'cancel'],
  defaultDecision: 'local_only',
  externalSendStillBlocked: true,
  noProviderCall: true,
  explanations: {
    local_only: 'Daten bleiben vollständig lokal. Sicherster Modus für interne oder unklare Inhalte.',
    anonymize_then_send: 'Späterer Modus: interne Daten werden anonymisiert, danach wäre eine separate Freigabe nötig. Aktuell noch blockiert.',
    cancel: 'Abbrechen, wenn Daten zu sensibel sind oder keine Freigabe vorliegt.',
  },
  nextStep: 'Als Nächstes echte Auswahl im UI speichern, aber weiterhin keinen Provider aufrufen.',
};
`;
write('frontend/lib/cmt-secure-master-approval-decision-preview.ts', decisionLib);

const pagePath = path.join(root, 'frontend/app/cmt/master/secure/agent/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.error('[missing] frontend/app/cmt/master/secure/agent/page.tsx');
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('cmt-secure-master-approval-decision-preview')) {
  page = page.replace(
    "import { secureMasterProviderValidationPreview } from '../../../../../lib/cmt-secure-master-provider-validation-preview';",
    "import { secureMasterProviderValidationPreview } from '../../../../../lib/cmt-secure-master-provider-validation-preview';\nimport { secureMasterApprovalDecisionPreview } from '../../../../../lib/cmt-secure-master-approval-decision-preview';"
  );
}

if (!page.includes('Lokaler Freigabeentscheid')) {
  page = page.replace(
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>",
    "</section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Lokaler Freigabeentscheid</h2>\n          <p style={{ color: '#fbbf24' }}>Externe Sendung bleibt blockiert. Diese Auswahl ist nur eine lokale Vorschau.</p>\n          <p>Standard: <b>{secureMasterApprovalDecisionPreview.defaultDecision}</b></p>\n          <p>Provider-Call blockiert: <b>{String(secureMasterApprovalDecisionPreview.noProviderCall)}</b></p>\n          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>\n            {secureMasterApprovalDecisionPreview.allowedDecisions.map((decision) => (\n              <button key={decision} disabled style={{ textAlign: 'left', border: '1px solid #334155', borderRadius: 12, background: '#020617', color: '#e5e7eb', padding: 12 }}>\n                <b>{decision}</b> — {secureMasterApprovalDecisionPreview.explanations[decision]}\n              </button>\n            ))}\n          </div>\n          <p style={{ color: '#94a3b8', fontSize: 13 }}>{secureMasterApprovalDecisionPreview.nextStep}</p>\n        </section>\n\n        <section style={{ border: '1px solid #334155', borderRadius: 18, background: '#111827', padding: 20 }}>\n          <h2>Voraussetzungen vor Live-KI</h2>"
  );
}

write('frontend/app/cmt/master/secure/agent/page.tsx', page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/lib/cmt-secure-master-approval-decision-preview.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Lokaler Freigabeentscheid','secureMasterApprovalDecisionPreview','local_only','anonymize_then_send','cancel']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] mvp-agent-9 verify passed');process.exit(ok?0:1);`;
write('scripts/v-mvp-agent-9.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['mvp9:verify'] = 'node scripts/v-mvp-agent-9.cjs';
pkg.scripts['agent:mvp9:verify'] = 'node scripts/v-mvp-agent-9.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts mvp9:verify agent:mvp9:verify');
console.log('[OK] mvp-agent-9 applied');

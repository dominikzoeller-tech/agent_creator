const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
}
function ensureFile(rel, content) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) write(rel, content);
  else console.log('[exists]', rel);
}
function ensureImport(page, importLine) {
  if (page.includes(importLine)) return page;
  const lines = page.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) lastImport = i;
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  return lines.join('\n');
}
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}

ensureFile('frontend/lib/cmt-secure-master-operator-panel.ts', `export type SecureMasterOperatorPanel = {
  localLogCount: number;
  providerDryRunCount: number;
  adapterDryRunCount: number;
  approvalDecision: string;
  currentRecommendation: string;
  currentRiskLevel: string;
  liveStatus: 'blocked';
  providerCallAllowed: false;
  dryRunOnly: true;
  nextThreshold: string;
};
export function createSecureMasterOperatorPanel(params: { localLogCount:number; providerDryRunCount:number; adapterDryRunCount:number; approvalDecision:string; currentRecommendation?:string; currentRiskLevel?:string; }): SecureMasterOperatorPanel {
  return { localLogCount: params.localLogCount, providerDryRunCount: params.providerDryRunCount, adapterDryRunCount: params.adapterDryRunCount, approvalDecision: params.approvalDecision, currentRecommendation: params.currentRecommendation ?? 'none', currentRiskLevel: params.currentRiskLevel ?? 'none', liveStatus: 'blocked', providerCallAllowed: false, dryRunOnly: true, nextThreshold: 'Naechste Schwelle: Provider-Adapter als deaktivierten Codepfad vorbereiten. Noch keine Live-KI aktivieren.' };
}
`);

ensureFile('frontend/lib/cmt-secure-master-action-plan.ts', `export type SecureMasterActionPlan = { headline:string; summary:string; steps:string[]; liveBoundary:string; providerCallAllowed:false; dryRunOnly:true; };
export function createSecureMasterActionPlan(params: { intent?:string; route?:string; privacyDecision?:string; approvalDecision?:string; hasProviderDryRun?:boolean; }): SecureMasterActionPlan {
  const route = params.route ?? 'direct';
  const privacy = params.privacyDecision ?? 'allow_local_only';
  const approval = params.approvalDecision ?? 'local_only';
  if (privacy === 'block_external' || approval === 'cancel') return { headline:'Sicher stoppen und lokal bleiben', summary:'Keine externe Verarbeitung.', steps:['lokal pruefen','sensible Bestandteile markieren','nicht senden'], liveBoundary:'Live-KI bleibt blockiert.', providerCallAllowed:false, dryRunOnly:true };
  if (route === 'privacy_gate') return { headline:'Datenschutz zuerst', summary:'Interne Daten erkannt.', steps:['lokal verarbeiten','anonymisieren vorbereiten','Freigabe pruefen'], liveBoundary:'Keine externe Weitergabe ohne Freigabe.', providerCallAllowed:false, dryRunOnly:true };
  if (route === 'tool_required') return { headline:'Provider-Dry-Run sinnvoll', summary:'Tool/aktuelle Daten waeren spaeter noetig.', steps:['Dry-Run simulieren','Datenquelle dokumentieren','keinen echten Call erlauben'], liveBoundary:'Dry-Run ja, echter Call nein.', providerCallAllowed:false, dryRunOnly:true };
  return { headline:'Lokal beantworten und protokollieren', summary:'Die Frage kann lokal eingeordnet werden.', steps:['Antwort pruefen','Verlauf speichern','bei Unsicherheit Gremium nutzen'], liveBoundary:'Keine externe Verarbeitung erforderlich.', providerCallAllowed:false, dryRunOnly:true };
}
`);

ensureFile('frontend/lib/cmt-secure-master-provider-adapter-pipeline.ts', `export type SecureMasterProviderPipelineStage = { id:'prepare'|'validate'|'approve'|'dispatch_blocked'; label:string; status:'ready'|'prepared'|'blocked'; detail:string; };
export type SecureMasterProviderAdapterPipeline = { pipelinePrepared:true; dryRunOnly:true; providerCallAllowed:false; adapterDispatchAllowed:false; currentStage:'dispatch_blocked'; stages: SecureMasterProviderPipelineStage[]; nextSafeStep:string; };
export function createSecureMasterProviderAdapterPipeline(params: { approvalDecision:string; privacyDecision?:string; hasAdapterContract:boolean; }): SecureMasterProviderAdapterPipeline {
  return { pipelinePrepared:true, dryRunOnly:true, providerCallAllowed:false, adapterDispatchAllowed:false, currentStage:'dispatch_blocked', stages:[{id:'prepare',label:'Adapter vorbereiten',status:params.hasAdapterContract?'prepared':'ready',detail:params.hasAdapterContract?'Adapter-Contract liegt lokal vor.':'Adapter-Contract kann lokal erstellt werden.'},{id:'validate',label:'Validieren',status:'prepared',detail:'Validierung wird lokal simuliert.'},{id:'approve',label:'Freigabe pruefen',status:params.approvalDecision==='local_only'?'prepared':'blocked',detail:'Externe Freigabe ist nicht aktiv.'},{id:'dispatch_blocked',label:'Dispatch blockiert',status:'blocked',detail:'Kein API-Key, kein Live-Schalter, kein Provider-Call.'}], nextSafeStep:'Live-Call bleibt aus. Erst Gates stabilisieren.' };
}
`);

ensureFile('frontend/lib/cmt-secure-master-live-readiness-matrix.ts', `export type SecureMasterLiveReadinessItem = { id:string; label:string; ready:boolean; requiredForLive:true; detail:string; };
export type SecureMasterLiveReadinessMatrix = { canGoLive:false; localMvpReady:true; providerLiveBlocked:true; items:SecureMasterLiveReadinessItem[]; missingCriticalCount:number; nextSafeStep:string; };
export function createSecureMasterLiveReadinessMatrix(params: { hasAdapterContract:boolean; hasAdapterPipeline:boolean; approvalDecision:string; providerCallAllowed:boolean; }): SecureMasterLiveReadinessMatrix {
  const items: SecureMasterLiveReadinessItem[] = [
    {id:'build',label:'Build stabil',ready:true,requiredForLive:true,detail:'Build muss gruen sein.'},
    {id:'approval',label:'Explizite Freigabe',ready:params.approvalDecision !== 'cancel',requiredForLive:true,detail:'Nutzerfreigabe erforderlich.'},
    {id:'adapter_contract',label:'Provider-Adapter-Contract',ready:params.hasAdapterContract,requiredForLive:true,detail:'Adapter-Contract lokal testen.'},
    {id:'adapter_pipeline',label:'Provider-Adapter-Pipeline',ready:params.hasAdapterPipeline,requiredForLive:true,detail:'Pipeline muss vorbereitet sein.'},
    {id:'secret_management',label:'Secret-Verwaltung',ready:false,requiredForLive:true,detail:'Keys nur serverseitig.'},
    {id:'budget_limit',label:'Kosten-/Token-Limit',ready:false,requiredForLive:true,detail:'Budget-Limit erforderlich.'},
    {id:'audit_log',label:'Audit-Log',ready:false,requiredForLive:true,detail:'Echte Calls muessen protokolliert werden.'},
    {id:'provider_call',label:'Provider-Call erlaubt',ready:params.providerCallAllowed,requiredForLive:true,detail:'Aktuell false.'},
  ];
  return { canGoLive:false, localMvpReady:true, providerLiveBlocked:true, items, missingCriticalCount: items.filter(i=>!i.ready).length, nextSafeStep:'Weiter lokal testen. Dann Live-Freigabe separat vorbereiten.' };
}
`);

let page = fs.readFileSync(pagePath, 'utf8');
page = ensureImport(page, "import { createSecureMasterOperatorPanel } from '../../../../../lib/cmt-secure-master-operator-panel';");
page = ensureImport(page, "import { createSecureMasterActionPlan } from '../../../../../lib/cmt-secure-master-action-plan';");
page = ensureImport(page, "import { createSecureMasterProviderAdapterPipeline } from '../../../../../lib/cmt-secure-master-provider-adapter-pipeline';");
page = ensureImport(page, "import { createSecureMasterLiveReadinessMatrix } from '../../../../../lib/cmt-secure-master-live-readiness-matrix';");
fs.writeFileSync(pagePath, page, 'utf8');
console.log('[write]', pageRel);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');let ok=true;for(const token of ['createSecureMasterOperatorPanel','cmt-secure-master-operator-panel','createSecureMasterActionPlan','createSecureMasterProviderAdapterPipeline','createSecureMasterLiveReadinessMatrix']){if(!page.includes(token)){console.error('[missing]',token);ok=false}else console.log('[ok]',token)}for(const rel of ['frontend/lib/cmt-secure-master-operator-panel.ts','frontend/lib/cmt-secure-master-action-plan.ts','frontend/lib/cmt-secure-master-provider-adapter-pipeline.ts','frontend/lib/cmt-secure-master-live-readiness-matrix.ts']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing file]',rel);ok=false}else console.log('[ok file]',rel)}if(ok)console.log('[OK] hotfix32a verify passed');process.exit(ok?0:1);`;
write('scripts/v-hotfix-32a.cjs', verify);
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['hotfix32a:verify'] = 'node scripts/v-hotfix-32a.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[OK] hotfix32a applied');

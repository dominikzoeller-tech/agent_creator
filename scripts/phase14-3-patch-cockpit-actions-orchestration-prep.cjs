const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); }
function ensureFile(file, content){ if(!exists(file)){ write(file, content); console.log("OK " + file + ": erstellt."); } else { console.log("SKIP " + file + ": existiert bereits."); } }
function patchPackage(){
  const file="package.json";
  const pkg=JSON.parse(read(file));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts["phase14:3:patch"]="node scripts/phase14-3-patch-cockpit-actions-orchestration-prep.cjs";
  pkg.scripts["phase14:3:verify"]="node scripts/phase14-3-verify-cockpit-actions-orchestration-prep.cjs";
  pkg.scripts["cockpit:actions:verify"]="node scripts/phase14-3-verify-cockpit-actions-orchestration-prep.cjs";
  write(file, JSON.stringify(pkg,null,2)+"\n");
  console.log("OK package.json: Phase 14.3 Scripts eingetragen.");
}
const store = String.raw`import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type CockpitActionType =
  | "review_capabilities"
  | "prepare_agent_blueprint"
  | "review_agent_registry"
  | "prepare_runtime_dry_run"
  | "prepare_tool_adapter_plan"
  | "review_audit";

export interface CockpitActionPlan {
  id: string;
  timestamp: string;
  actionType: CockpitActionType;
  title: string;
  targetHref: string;
  source: "master-cockpit";
  status: "planned";
  orchestrationReady: true;
  executionAllowed: false;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function plansPath(): string { return path.join(dataDir(), "cockpit-action-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendPlan(plan: CockpitActionPlan): void { ensureStore(); appendFileSync(plansPath(), JSON.stringify(plan)+"\n", "utf8"); }
export function listCockpitActionPlans(limit = 100): CockpitActionPlan[] {
  ensureStore();
  try {
    return readFileSync(plansPath(), "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line) as CockpitActionPlan; } catch { return null; } }).filter((entry): entry is CockpitActionPlan => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 500)));
  } catch { return []; }
}
function actionConfig(actionType: CockpitActionType): { title:string; targetHref:string; reason:string } {
  const map: Record<CockpitActionType, { title:string; targetHref:string; reason:string }> = {
    review_capabilities: { title:"Fehlende Fähigkeiten prüfen", targetHref:"/capability-requests", reason:"Capability Requests prüfen, bevor Agenten oder Tools vorbereitet werden." },
    prepare_agent_blueprint: { title:"Agent Blueprint vorbereiten", targetHref:"/agent-blueprints", reason:"Agent Blueprint als Vorschlag vorbereiten, keine automatische Aktivierung." },
    review_agent_registry: { title:"Agent Registry prüfen", targetHref:"/agent-registry", reason:"Controlled Agent Registry prüfen, bevor Runtime Dry-runs entstehen." },
    prepare_runtime_dry_run: { title:"Runtime Dry-run vorbereiten", targetHref:"/agent-runtime-dashboard", reason:"Runtime nur als Dry-run vorbereiten; keine echte Ausführung." },
    prepare_tool_adapter_plan: { title:"Tool Adapter Plan vorbereiten", targetHref:"/tool-adapter-dashboard", reason:"Tool Adapter nur als Dry-run Plan vorbereiten; keine echte Tool-Ausführung." },
    review_audit: { title:"Audit Trail prüfen", targetHref:"/governance-audit", reason:"Audit Trail prüfen, bevor weitere Schritte ausgeführt werden." },
  };
  return map[actionType];
}
export function createCockpitActionPlan(input: { actionType: CockpitActionType; metadata?: Record<string, unknown> }): CockpitActionPlan {
  const cfg = actionConfig(input.actionType);
  const plan: CockpitActionPlan = {
    id: makeId("cockpit-action"),
    timestamp: new Date().toISOString(),
    actionType: input.actionType,
    title: cfg.title,
    targetHref: cfg.targetHref,
    source: "master-cockpit",
    status: "planned",
    orchestrationReady: true,
    executionAllowed: false,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason: cfg.reason,
    metadata: { ...(input.metadata || {}), phase: "14.3", noExecution: true },
  };
  appendPlan(plan);
  return plan;
}
export function summarizeCockpitActionPlans(plans: CockpitActionPlan[]) { const byActionType: Record<string, number> = {}; for(const plan of plans) byActionType[plan.actionType] = (byActionType[plan.actionType] || 0) + 1; return { total: plans.length, byActionType }; }
`;
const api = String.raw`import { createCockpitActionPlan, listCockpitActionPlans, summarizeCockpitActionPlans, type CockpitActionType } from "../../../lib/cockpit-action-store";
export const dynamic = "force-dynamic";
const allowed = new Set(["review_capabilities", "prepare_agent_blueprint", "review_agent_registry", "prepare_runtime_dry_run", "prepare_tool_adapter_plan", "review_audit"]);
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const plans = listCockpitActionPlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeCockpitActionPlans(plans), plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Cockpit Action Plans konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const actionType = typeof body.actionType === "string" ? body.actionType : "";
    if(!allowed.has(actionType)) return Response.json({ ok:false, error:"Ungültiger actionType." }, { status:400 });
    const plan = createCockpitActionPlan({ actionType: actionType as CockpitActionType, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, plan });
  } catch(error){
    const message = error instanceof Error ? error.message : "Cockpit Action Plan konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
`;
function patchCockpit(){
  const file="frontend/app/master-cockpit/page.tsx";
  if(!exists(file)){ console.log("SKIP master-cockpit fehlt: Phase 14.0/14.2 zuerst anwenden."); return; }
  let content=read(file); const original=content;
  if(!content.includes("Cockpit Actions / Orchestration Prep")){
    content = content.replace('const [error,setError]=useState<string|null>(null);', 'const [error,setError]=useState<string|null>(null);\n  const [actionMessage,setActionMessage]=useState<string|null>(null);');
    content = content.replace('async function load(){', 'async function createActionPlan(actionType:string){\n    setActionMessage(null);\n    try{\n      const res=await fetch("/api/cockpit-actions", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ actionType }) });\n      const payload=await res.json();\n      if(!res.ok) throw new Error(payload?.error || "Cockpit Action fehlgeschlagen");\n      setActionMessage("Cockpit Action geplant: " + payload.plan.title);\n    } catch(e){ setError(e instanceof Error ? e.message : "Unbekannter Fehler"); }\n  }\n  async function load(){');
    content = content.replace('<section className="panel-card"><h2>Guided Next Actions</h2>', '{actionMessage ? <section className="panel-card" style={{ borderColor:"#bbf7d0", background:"#f0fdf4" }}>{actionMessage}</section> : null}<section className="panel-card"><h2>Guided Next Actions</h2>');
    content = content.replace('{guidedSteps.map((step)=><a key={step.id} href={step.href} className={step.id===nextPrimary.id?"phase14-guided-step active":"phase14-guided-step"}><div><strong>{step.title}</strong><p>{step.description}</p></div><span className="chip">{statusLabel(step.status)}</span></a>)}</div></section>', '{guidedSteps.map((step)=><div key={step.id} className={step.id===nextPrimary.id?"phase14-guided-step active":"phase14-guided-step"}><a href={step.href} style={{ color:"inherit", textDecoration:"none", flex:1 }}><strong>{step.title}</strong><p>{step.description}</p></a><div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}><span className="chip">{statusLabel(step.status)}</span><button className="secondary-button" type="button" onClick={()=>createActionPlan(step.id=== "capabilities" ? "review_capabilities" : step.id === "blueprints" ? "prepare_agent_blueprint" : step.id === "registry" ? "review_agent_registry" : step.id === "runtime" ? "prepare_runtime_dry_run" : step.id === "tools" ? "prepare_tool_adapter_plan" : "review_audit")}>Planen</button></div></div>)}</div></section>');
    content = content.replace('Guided Flow: Das Cockpit zeigt den nächsten sinnvollen Schritt', 'Cockpit Actions / Orchestration Prep: Das Cockpit zeigt den nächsten sinnvollen Schritt');
  }
  if(content!==original){ write(file, content); console.log("OK master-cockpit: Cockpit Actions ergänzt."); } else console.log("SKIP master-cockpit: Cockpit Actions bereits vorhanden.");
}
function patchDocs(){
  ensureFile("phase14-3-cockpit-actions-orchestration-prep.md", `# Phase 14.3 – Cockpit Actions / Master-Agent Orchestration Prep

## Ziel
Guided Steps im Master Cockpit können als Cockpit Action Plans gespeichert werden. Das bereitet Master-Agent-Orchestrierung vor, ohne echte Ausführung zu erlauben.

## Neue API / Store
- API: /api/cockpit-actions
- Store: data/cockpit-action-plans.jsonl

## Sicherheitsprinzip
- executionAllowed=false
- toolExecutionAllowed=false
- dryRunOnly=true
- keine echte Tool-Ausführung
- keine automatische Agent-Ausführung

## Zweck
Der Master Agent soll später diese Action Plans orchestrieren können. Aktuell werden nur sichere Planungsobjekte erzeugt.

## Nächster Schritt
Phase 14.4 kann Cockpit Action Dashboard / Action History ergänzen.
`);
  ensureFile("docs/phase14-cockpit-actions-orchestration-prep-runbook.md", `# Runbook – Phase 14.3 Cockpit Actions / Orchestration Prep

## Patch
\`\`\`powershell
npm run phase14:3:patch
\`\`\`

Falls Script noch nicht registriert ist:
\`\`\`powershell
node scripts/phase14-3-patch-cockpit-actions-orchestration-prep.cjs
\`\`\`

## Verify
\`\`\`powershell
npm run phase14:3:verify
npm run build
\`\`\`

Docker-Neustart nur für Browser-Test:
\`\`\`powershell
npm run stack:up:detached
npm run stack:health
\`\`\`

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Bei Guided Next Actions auf Planen klicken.
3. /api/cockpit-actions prüfen.
4. Sicherstellen: executionAllowed=false, toolExecutionAllowed=false, dryRunOnly=true.
`);
}
patchPackage();
ensureFile("frontend/lib/cockpit-action-store.ts", store);
ensureFile("frontend/app/api/cockpit-actions/route.ts", api);
patchCockpit();
patchDocs();
console.log("Phase 14.3 Patch abgeschlossen.");

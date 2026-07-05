import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
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
    review_capabilities: { title:"Fehlende FÃ¤higkeiten prÃ¼fen", targetHref:"/capability-requests", reason:"Capability Requests prÃ¼fen, bevor Agenten oder Tools vorbereitet werden." },
    prepare_agent_blueprint: { title:"Agent Blueprint vorbereiten", targetHref:"/agent-blueprints", reason:"Agent Blueprint als Vorschlag vorbereiten, keine automatische Aktivierung." },
    review_agent_registry: { title:"Agent Registry prÃ¼fen", targetHref:"/agent-registry", reason:"Controlled Agent Registry prÃ¼fen, bevor Runtime Dry-runs entstehen." },
    prepare_runtime_dry_run: { title:"Runtime Dry-run vorbereiten", targetHref:"/agent-runtime-dashboard", reason:"Runtime nur als Dry-run vorbereiten; keine echte AusfÃ¼hrung." },
    prepare_tool_adapter_plan: { title:"Tool Adapter Plan vorbereiten", targetHref:"/tool-adapter-dashboard", reason:"Tool Adapter nur als Dry-run Plan vorbereiten; keine echte Tool-AusfÃ¼hrung." },
    review_audit: { title:"Audit Trail prÃ¼fen", targetHref:"/governance-audit", reason:"Audit Trail prÃ¼fen, bevor weitere Schritte ausgefÃ¼hrt werden." },
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


import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterResumeDecision =
  | "resume_dry_run_allowed"
  | "blocked_missing_binding"
  | "blocked_not_approved"
  | "blocked_missing_plan"
  | "blocked_tool_execution";

export interface ApprovedToolAdapterResumePlan {
  id: string;
  timestamp: string;
  toolExecutionPlanId: string;
  consentBindingId?: string;
  consentRequestId?: string;
  consentStatus?: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction?: string;
  decision: ToolAdapterResumeDecision;
  resumeAllowed: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "tool-adapter-consent-bindings.json"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function resumePath(): string { return path.join(dataDir(), "approved-tool-adapter-resume-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonArray(file: string): any[] { try { const parsed = JSON.parse(readFileSync(file, "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendResume(plan: ApprovedToolAdapterResumePlan): void { ensureStore(); appendFileSync(resumePath(), JSON.stringify(plan) + "\n", "utf8"); }
export function listApprovedToolAdapterResumePlans(limit = 100): ApprovedToolAdapterResumePlan[] { ensureStore(); return readJsonl(resumePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function createApprovedToolAdapterResumePlan(input: { toolExecutionPlanId?: string; consentBindingId?: string; consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedToolAdapterResumePlan {
  ensureStore();
  const plans = readJsonl(plansPath());
  const bindings = readJsonArray(bindingPath());
  const consentRequests = readJsonArray(consentPath());
  const binding = bindings.find((entry:any) =>
    (input.consentBindingId && entry.id === input.consentBindingId) ||
    (input.consentRequestId && entry.consentRequestId === input.consentRequestId) ||
    (input.toolExecutionPlanId && entry.toolExecutionPlanId === input.toolExecutionPlanId)
  );
  const toolExecutionPlanId = input.toolExecutionPlanId || binding?.toolExecutionPlanId;
  const plan = plans.find((entry:any)=>entry.id === toolExecutionPlanId);
  const consentRequestId = input.consentRequestId || binding?.consentRequestId;
  const consentRequest = consentRequests.find((entry:any)=>entry.id === consentRequestId);
  let decision: ToolAdapterResumeDecision = "resume_dry_run_allowed";
  let reason = "Approved Tool Adapter Resume Plan erstellt. Phase 13.2 erlaubt weiterhin nur Dry-run Resume ohne Tool-AusfÃ¼hrung.";
  if(!binding){ decision = "blocked_missing_binding"; reason = "Tool Adapter Consent Binding nicht gefunden."; }
  else if(!plan){ decision = "blocked_missing_plan"; reason = "Tool Execution Plan nicht gefunden."; }
  else if((consentRequest?.status || binding.status) !== "approved"){ decision = "blocked_not_approved"; reason = "Tool Adapter Consent Binding ist nicht approved."; }
  else if(plan.toolExecutionAllowed !== false || plan.dryRunOnly !== true){ decision = "blocked_tool_execution"; reason = "Tool Execution Plan verletzt Dry-run Sicherheitsregeln."; }
  const resumeAllowed = decision === "resume_dry_run_allowed";
  const resume: ApprovedToolAdapterResumePlan = {
    id: makeId("tool-adapter-resume"),
    timestamp: new Date().toISOString(),
    toolExecutionPlanId: toolExecutionPlanId || "missing-tool-execution-plan",
    consentBindingId: binding?.id || input.consentBindingId,
    consentRequestId,
    consentStatus: consentRequest?.status || binding?.status,
    adapterId: plan?.adapterId || binding?.adapterId,
    adapterName: plan?.adapterName || binding?.adapterName,
    requestedAction: plan?.requestedAction || binding?.requestedAction,
    decision,
    resumeAllowed,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "approved-tool-adapter-resume", noToolExecution: true },
  };
  appendResume(resume);
  return resume;
}
export function summarizeApprovedToolAdapterResumePlans(plans: ApprovedToolAdapterResumePlan[]) { const byDecision: Record<string, number> = {}; for(const plan of plans) byDecision[plan.decision] = (byDecision[plan.decision] || 0) + 1; return { total: plans.length, byDecision }; }


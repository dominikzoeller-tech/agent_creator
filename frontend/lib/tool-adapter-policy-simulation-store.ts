import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ToolAdapterPolicyDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_resume"
  | "blocked_resume_not_allowed"
  | "blocked_tool_execution"
  | "blocked_missing_consent"
  | "blocked_policy_violation";

export interface ToolAdapterPolicySimulationResult {
  id: string;
  timestamp: string;
  resumePlanId?: string;
  toolExecutionPlanId?: string;
  adapterName?: string;
  requestedAction?: string;
  decision: ToolAdapterPolicyDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resumePath(): string { return path.join(dataDir(), "approved-tool-adapter-resume-plans.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "tool-adapter-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendSimulation(result: ToolAdapterPolicySimulationResult): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(result) + "\n", "utf8"); }
export function listToolAdapterPolicySimulations(limit = 100): ToolAdapterPolicySimulationResult[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function simulateToolAdapterPolicy(input: { resumePlanId?: string; metadata?: Record<string, unknown> }): ToolAdapterPolicySimulationResult {
  ensureStore();
  const resumes = readJsonl(resumePath());
  const resume = resumes.find((entry:any) => input.resumePlanId ? entry.id === input.resumePlanId : true);
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];
  checks.push({ name: "resume_exists", passed: Boolean(resume), reason: resume ? "Tool Adapter Resume Plan gefunden." : "Tool Adapter Resume Plan fehlt." });
  checks.push({ name: "resume_allowed", passed: resume?.resumeAllowed === true, reason: resume?.resumeAllowed === true ? "Dry-run Resume ist erlaubt." : "Resume ist nicht erlaubt." });
  checks.push({ name: "tool_execution_blocked", passed: resume?.toolExecutionAllowed === false, reason: resume?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name: "dry_run_only", passed: resume?.dryRunOnly === true, reason: resume?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name: "consent_approved", passed: resume?.consentStatus === "approved", reason: resume?.consentStatus === "approved" ? "Consent ist approved." : "Consent ist nicht approved." });
  let decision: ToolAdapterPolicyDecision = "simulation_allowed_dry_run";
  let reason = "Tool Adapter Policy Simulation erlaubt ausschließlich Dry-run. Keine echte Tool-Ausführung.";
  if (!resume) { decision = "blocked_missing_resume"; reason = "Tool Adapter Resume Plan nicht gefunden."; }
  else if (resume.resumeAllowed !== true) { decision = "blocked_resume_not_allowed"; reason = "Resume Plan erlaubt keinen Resume."; }
  else if (resume.toolExecutionAllowed !== false || resume.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Dry-run Sicherheitsregeln verletzt."; }
  else if (resume.consentStatus !== "approved") { decision = "blocked_missing_consent"; reason = "Consent ist nicht approved."; }
  else if (checks.some((check) => !check.passed)) { decision = "blocked_policy_violation"; reason = "Mindestens ein Policy Check ist fehlgeschlagen."; }
  const result: ToolAdapterPolicySimulationResult = {
    id: makeId("tool-policy-sim"),
    timestamp: new Date().toISOString(),
    resumePlanId: resume?.id || input.resumePlanId,
    toolExecutionPlanId: resume?.toolExecutionPlanId,
    adapterName: resume?.adapterName,
    requestedAction: resume?.requestedAction,
    decision,
    policyChecks: checks,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    simulated: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "tool-adapter-policy-simulation", noToolExecution: true },
  };
  appendSimulation(result);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: result.resumePlanId,
    status: result.decision,
    riskLevel: "medium",
    summary: "Tool Adapter Policy Simulation: " + result.decision,
    metadata: { source: "phase13.3-tool-adapter-policy-simulation", simulationId: result.id, toolExecutionAllowed: false, dryRunOnly: true },
  });
  return result;
}
export function summarizeToolAdapterPolicySimulations(results: ToolAdapterPolicySimulationResult[]) { const byDecision: Record<string, number> = {}; for (const result of results) byDecision[result.decision] = (byDecision[result.decision] || 0) + 1; return { total: results.length, byDecision }; }

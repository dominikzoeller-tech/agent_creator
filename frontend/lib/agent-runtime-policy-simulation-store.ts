import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type RuntimePolicySimulationDecision =
  | "simulation_allowed_dry_run"
  | "blocked_missing_resume"
  | "blocked_resume_not_allowed"
  | "blocked_tool_execution"
  | "blocked_missing_consent"
  | "blocked_policy_violation";

export interface RuntimePolicySimulationResult {
  id: string;
  timestamp: string;
  resumeEnvelopeId?: string;
  runtimeEnvelopeId?: string;
  agentName?: string;
  requestedAction?: string;
  decision: RuntimePolicySimulationDecision;
  policyChecks: Array<{ name: string; passed: boolean; reason: string }>;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  simulated: true;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function resumePath(): string { return path.join(dataDir(), "approved-runtime-resume-envelopes.jsonl"); }
function simulationPath(): string { return path.join(dataDir(), "agent-runtime-policy-simulations.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendSimulation(result: RuntimePolicySimulationResult): void { ensureStore(); appendFileSync(simulationPath(), JSON.stringify(result) + "\n", "utf8"); }
export function listRuntimePolicySimulations(limit = 100): RuntimePolicySimulationResult[] { ensureStore(); return readJsonl(simulationPath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function simulateRuntimePolicy(input: { resumeEnvelopeId?: string; metadata?: Record<string, unknown> }): RuntimePolicySimulationResult {
  ensureStore();
  const resumes = readJsonl(resumePath());
  const resume = resumes.find((entry:any) => input.resumeEnvelopeId ? entry.id === input.resumeEnvelopeId : true);
  const checks: Array<{ name: string; passed: boolean; reason: string }> = [];
  checks.push({ name: "resume_exists", passed: Boolean(resume), reason: resume ? "Resume Envelope gefunden." : "Resume Envelope fehlt." });
  checks.push({ name: "resume_allowed", passed: resume?.resumeAllowed === true, reason: resume?.resumeAllowed === true ? "Dry-run Resume ist erlaubt." : "Resume ist nicht erlaubt." });
  checks.push({ name: "tool_execution_blocked", passed: resume?.toolExecutionAllowed === false, reason: resume?.toolExecutionAllowed === false ? "Tool-Ausführung bleibt blockiert." : "Tool-Ausführung wäre nicht blockiert." });
  checks.push({ name: "dry_run_only", passed: resume?.dryRunOnly === true, reason: resume?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name: "consent_approved", passed: resume?.consentStatus === "approved", reason: resume?.consentStatus === "approved" ? "Consent ist approved." : "Consent ist nicht approved." });
  let decision: RuntimePolicySimulationDecision = "simulation_allowed_dry_run";
  let reason = "Policy Simulation erlaubt ausschließlich Dry-run. Keine echte Tool-Ausführung.";
  if (!resume) { decision = "blocked_missing_resume"; reason = "Resume Envelope nicht gefunden."; }
  else if (resume.resumeAllowed !== true) { decision = "blocked_resume_not_allowed"; reason = "Resume Envelope erlaubt keinen Resume."; }
  else if (resume.toolExecutionAllowed !== false || resume.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Dry-run Sicherheitsregeln verletzt."; }
  else if (resume.consentStatus !== "approved") { decision = "blocked_missing_consent"; reason = "Consent ist nicht approved."; }
  else if (checks.some((check) => !check.passed)) { decision = "blocked_policy_violation"; reason = "Mindestens ein Policy Check ist fehlgeschlagen."; }
  const result: RuntimePolicySimulationResult = {
    id: makeId("policy-sim"),
    timestamp: new Date().toISOString(),
    resumeEnvelopeId: resume?.id || input.resumeEnvelopeId,
    runtimeEnvelopeId: resume?.runtimeEnvelopeId,
    agentName: resume?.agentName,
    requestedAction: resume?.requestedAction,
    decision,
    policyChecks: checks,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    simulated: true,
    reason,
    metadata: { ...(input.metadata || {}), source: "runtime-policy-simulation", noToolExecution: true },
  };
  appendSimulation(result);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: result.resumeEnvelopeId,
    status: result.decision,
    riskLevel: "medium",
    summary: "Runtime Policy Simulation: " + result.decision,
    metadata: { source: "phase12.3-runtime-policy-simulation", simulationId: result.id, toolExecutionAllowed: false, dryRunOnly: true },
  });
  return result;
}
export function summarizeRuntimePolicySimulations(results: RuntimePolicySimulationResult[]) { const byDecision: Record<string, number> = {}; for (const result of results) byDecision[result.decision] = (byDecision[result.decision] || 0) + 1; return { total: results.length, byDecision }; }

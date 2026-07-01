import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeResumeDecision = "resume_dry_run_allowed" | "blocked_missing_binding" | "blocked_not_approved" | "blocked_missing_envelope" | "blocked_tool_execution";
export interface ApprovedRuntimeResumeEnvelope {
  id: string;
  timestamp: string;
  runtimeEnvelopeId: string;
  consentBindingId?: string;
  consentRequestId?: string;
  consentStatus?: string;
  agentId?: string;
  agentName?: string;
  requestedAction?: string;
  decision: RuntimeResumeDecision;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  resumeAllowed: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function runtimePath(): string { return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl"); }
function bindingPath(): string { return path.join(dataDir(), "agent-runtime-consent-bindings.json"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function resumePath(): string { return path.join(dataDir(), "approved-runtime-resume-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonArray(file: string): any[] { try { const parsed = JSON.parse(readFileSync(file, "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function readJsonl(file: string): any[] { try { return readFileSync(file, "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function appendResume(envelope: ApprovedRuntimeResumeEnvelope): void { ensureStore(); appendFileSync(resumePath(), JSON.stringify(envelope) + "\n", "utf8"); }
export function listApprovedRuntimeResumeEnvelopes(limit = 100): ApprovedRuntimeResumeEnvelope[] { ensureStore(); return readJsonl(resumePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500))); }
export function createApprovedRuntimeResumeEnvelope(input: { runtimeEnvelopeId?: string; consentBindingId?: string; consentRequestId?: string; metadata?: Record<string, unknown> }): ApprovedRuntimeResumeEnvelope {
  ensureStore();
  const runtimeEnvelopes = readJsonl(runtimePath());
  const bindings = readJsonArray(bindingPath());
  const consentRequests = readJsonArray(consentPath());
  const binding = bindings.find((entry:any) =>
    (input.consentBindingId && entry.id === input.consentBindingId) ||
    (input.consentRequestId && entry.consentRequestId === input.consentRequestId) ||
    (input.runtimeEnvelopeId && entry.runtimeEnvelopeId === input.runtimeEnvelopeId)
  );
  const runtimeEnvelopeId = input.runtimeEnvelopeId || binding?.runtimeEnvelopeId;
  const runtimeEnvelope = runtimeEnvelopes.find((entry:any) => entry.id === runtimeEnvelopeId);
  const consentRequestId = input.consentRequestId || binding?.consentRequestId;
  const consentRequest = consentRequests.find((entry:any) => entry.id === consentRequestId);
  let decision: RuntimeResumeDecision = "resume_dry_run_allowed";
  let reason = "Approved Runtime Resume Envelope erstellt. Phase 12.2 erlaubt weiterhin nur Dry-run Resume ohne Tool-Ausführung.";
  if (!binding) { decision = "blocked_missing_binding"; reason = "Runtime Consent Binding nicht gefunden."; }
  else if (!runtimeEnvelope) { decision = "blocked_missing_envelope"; reason = "Runtime Envelope nicht gefunden."; }
  else if ((consentRequest?.status || binding.status) !== "approved") { decision = "blocked_not_approved"; reason = "Consent Binding ist nicht approved."; }
  else if (runtimeEnvelope.toolExecutionAllowed !== false || runtimeEnvelope.dryRunOnly !== true) { decision = "blocked_tool_execution"; reason = "Runtime Envelope verletzt Dry-run Sicherheitsregeln."; }
  const resumeAllowed = decision === "resume_dry_run_allowed";
  const envelope: ApprovedRuntimeResumeEnvelope = {
    id: makeId("runtime-resume"),
    timestamp: new Date().toISOString(),
    runtimeEnvelopeId: runtimeEnvelopeId || "missing-runtime-envelope",
    consentBindingId: binding?.id || input.consentBindingId,
    consentRequestId: consentRequestId,
    consentStatus: consentRequest?.status || binding?.status,
    agentId: runtimeEnvelope?.agentId || binding?.agentId,
    agentName: runtimeEnvelope?.agentName || binding?.agentName,
    requestedAction: runtimeEnvelope?.requestedAction || binding?.requestedAction,
    decision,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    resumeAllowed,
    reason,
    metadata: { ...(input.metadata || {}), source: "approved-runtime-resume", noToolExecution: true },
  };
  appendResume(envelope);
  return envelope;
}
export function summarizeApprovedRuntimeResumeEnvelopes(envelopes: ApprovedRuntimeResumeEnvelope[]) { const byDecision: Record<string, number> = {}; for (const envelope of envelopes) byDecision[envelope.decision] = (byDecision[envelope.decision] || 0) + 1; return { total: envelopes.length, byDecision }; }

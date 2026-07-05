import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeConsentBindingStatus = "pending" | "approved" | "denied" | "expired";
export interface RuntimeConsentBinding {
  id: string;
  runtimeEnvelopeId: string;
  consentRequestId: string;
  status: RuntimeConsentBindingStatus;
  source: "agent-runtime";
  requestedAt: string;
  decidedAt?: string;
  agentId?: string;
  agentName?: string;
  requestedAction?: string;
  consentUrl: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function bindingPath(): string { return path.join(dataDir(), "agent-runtime-consent-bindings.json"); }
function runtimePath(): string { return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl"); }
function consentPath(): string { return path.join(dataDir(), "tool-consent-requests.json"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(bindingPath(), "utf8"); } catch { writeFileSync(bindingPath(), "[]\n", "utf8"); } try { readFileSync(consentPath(), "utf8"); } catch { writeFileSync(consentPath(), "[]\n", "utf8"); } }
function readBindings(): RuntimeConsentBinding[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(bindingPath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry: any) => entry && typeof entry.id === "string") : []; } catch { return []; } }
function writeBindings(bindings: RuntimeConsentBinding[]): void { ensureStore(); writeFileSync(bindingPath(), JSON.stringify(bindings, null, 2) + "\n", "utf8"); }
function readConsentRequests(): any[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(consentPath(), "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function writeConsentRequests(requests: any[]): void { ensureStore(); writeFileSync(consentPath(), JSON.stringify(requests, null, 2) + "\n", "utf8"); }
function readRuntimeEnvelopes(): any[] { try { const raw = readFileSync(runtimePath(), "utf8"); return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix: string): string { const now = new Date().toISOString(); return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
export function listRuntimeConsentBindings(): RuntimeConsentBinding[] { return readBindings().sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt))); }
export function createRuntimeConsentBinding(input: { runtimeEnvelopeId: string; metadata?: Record<string, unknown> }): RuntimeConsentBinding {
  ensureStore();
  const runtimeEnvelopeId = input.runtimeEnvelopeId.trim();
  if (!runtimeEnvelopeId) throw new Error("runtimeEnvelopeId ist erforderlich.");
  const envelope = readRuntimeEnvelopes().find((entry) => entry && entry.id === runtimeEnvelopeId);
  if (!envelope) throw new Error("Runtime Envelope nicht gefunden.");
  const now = new Date().toISOString();
  const consentRequestId = makeId("runtime-consent");
  const binding: RuntimeConsentBinding = {
    id: makeId("runtime-binding"),
    runtimeEnvelopeId,
    consentRequestId,
    status: "pending",
    source: "agent-runtime",
    requestedAt: now,
    agentId: envelope.agentId,
    agentName: envelope.agentName,
    requestedAction: envelope.requestedAction,
    consentUrl: "/tool-consent?requestId=" + encodeURIComponent(consentRequestId),
    metadata: { ...(input.metadata || {}), source: "agent-runtime", envelopeDecision: envelope.decision, dryRunOnly: envelope.dryRunOnly, toolExecutionAllowed: envelope.toolExecutionAllowed },
  };
  const consentRequest = {
    id: consentRequestId,
    status: "pending",
    toolId: "agent-runtime:" + (envelope.agentName || envelope.agentId || "unknown-agent"),
    toolName: "Controlled Agent Runtime",
    reason: "Runtime Consent Binding fÃ¼r Dry-run Envelope. Phase 12.1 erlaubt weiterhin keine echte Tool-AusfÃ¼hrung.",
    userInputPreview: String(envelope.requestedAction || "runtime-action").slice(0,240),
    sensitivity: "internal",
    processingMode: "local_only",
    requestedAt: now,
    createdAt: now,
    source: "agent-runtime",
    metadata: { runtimeEnvelopeId, bindingId: binding.id, dryRunOnly: true, toolExecutionAllowed: false },
  };
  writeConsentRequests([consentRequest, ...readConsentRequests()]);
  writeBindings([binding, ...readBindings()]);
  return binding;
}
export function syncRuntimeConsentBindingStatuses(): RuntimeConsentBinding[] {
  const consentRequests = readConsentRequests();
  const bindings = readBindings();
  let changed = false;
  const synced = bindings.map((binding) => {
    const request = consentRequests.find((entry: any) => entry && entry.id === binding.consentRequestId);
    if (!request || request.status === binding.status) return binding;
    changed = true;
    return { ...binding, status: request.status, decidedAt: request.decidedAt || request.updatedAt || binding.decidedAt };
  });
  if (changed) writeBindings(synced);
  return synced.sort((a,b)=>String(b.requestedAt).localeCompare(String(a.requestedAt)));
}
export function summarizeRuntimeConsentBindings(bindings: RuntimeConsentBinding[]) { const byStatus: Record<string, number> = {}; for (const binding of bindings) byStatus[binding.status] = (byStatus[binding.status] || 0) + 1; return { total: bindings.length, byStatus }; }


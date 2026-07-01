import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";

export type RuntimeMode = "dry_run" | "test_mode";
export type RuntimeDecision = "allowed_dry_run" | "blocked_disabled" | "blocked_missing_agent" | "blocked_not_active" | "blocked_permission" | "consent_required";

export interface ControlledAgentRuntimeEnvelope {
  id: string;
  timestamp: string;
  mode: RuntimeMode;
  decision: RuntimeDecision;
  agentId?: string;
  agentName?: string;
  requestedAction: string;
  status?: string;
  requiredPermissions: string[];
  grantedPermissions: string[];
  missingPermissions: string[];
  requiresConsent: boolean;
  consentRequired: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function registryPath(): string {
  return path.join(dataDir(), "controlled-agent-registry.json");
}
function runtimeLogPath(): string {
  return path.join(dataDir(), "controlled-agent-runtime-envelopes.jsonl");
}
function ensureDataDir(): void {
  mkdirSync(dataDir(), { recursive: true });
}
function readRegistry(): any[] {
  ensureDataDir();
  try {
    const parsed = JSON.parse(readFileSync(registryPath(), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function makeId(prefix: string): string {
  const now = new Date().toISOString();
  return prefix + "-" + now.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
function appendEnvelope(envelope: ControlledAgentRuntimeEnvelope): void {
  ensureDataDir();
  appendFileSync(runtimeLogPath(), JSON.stringify(envelope) + "\n", "utf8");
}
export function listControlledAgentRuntimeEnvelopes(limit = 100): ControlledAgentRuntimeEnvelope[] {
  ensureDataDir();
  try {
    const raw = readFileSync(runtimeLogPath(), "utf8");
    return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line) as ControlledAgentRuntimeEnvelope; } catch { return null; }
    }).filter((entry): entry is ControlledAgentRuntimeEnvelope => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 500)));
  } catch { return []; }
}
export function createControlledAgentRuntimeEnvelope(input: { agentId?: string; agentName?: string; requestedAction: string; requiredPermissions?: string[]; mode?: RuntimeMode; metadata?: Record<string, unknown>; }): ControlledAgentRuntimeEnvelope {
  const registry = readRegistry();
  const agent = registry.find((entry) => (input.agentId && entry.id === input.agentId) || (input.agentName && entry.agentName === input.agentName));
  const requiredPermissions = input.requiredPermissions || [];
  const grantedPermissions = Array.isArray(agent?.permissions) ? agent.permissions.filter((p: unknown): p is string => typeof p === "string") : [];
  const missingPermissions = requiredPermissions.filter((permission) => !grantedPermissions.includes(permission));
  let decision: RuntimeDecision = "allowed_dry_run";
  let reason = "Dry-run Runtime Envelope erstellt. Keine echte Tool-Ausführung erlaubt.";
  if (!agent) { decision = "blocked_missing_agent"; reason = "Controlled Agent Registry Entry nicht gefunden."; }
  else if (agent.status === "disabled") { decision = "blocked_disabled"; reason = "Controlled Agent ist disabled."; }
  else if (agent.status !== "active" && agent.status !== "test_mode") { decision = "blocked_not_active"; reason = "Controlled Agent ist nicht active/test_mode."; }
  else if (missingPermissions.length > 0) { decision = "blocked_permission"; reason = "Erforderliche Permissions fehlen."; }
  else if (agent.requiresConsent !== false) { decision = "consent_required"; reason = "Consent wäre vor echter Ausführung erforderlich; Phase 12.0 erlaubt nur Dry-run."; }
  const envelope: ControlledAgentRuntimeEnvelope = {
    id: makeId("runtime-envelope"),
    timestamp: new Date().toISOString(),
    mode: input.mode || "dry_run",
    decision,
    agentId: agent?.id || input.agentId,
    agentName: agent?.agentName || input.agentName,
    requestedAction: input.requestedAction,
    status: agent?.status,
    requiredPermissions,
    grantedPermissions,
    missingPermissions,
    requiresConsent: agent?.requiresConsent !== false,
    consentRequired: agent?.requiresConsent !== false,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: input.metadata,
  };
  appendEnvelope(envelope);
  return envelope;
}
export function summarizeControlledAgentRuntime(envelopes: ControlledAgentRuntimeEnvelope[]) {
  const byDecision: Record<string, number> = {};
  const byMode: Record<string, number> = {};
  for (const envelope of envelopes) {
    byDecision[envelope.decision] = (byDecision[envelope.decision] || 0) + 1;
    byMode[envelope.mode] = (byMode[envelope.mode] || 0) + 1;
  }
  return { total: envelopes.length, byDecision, byMode };
}

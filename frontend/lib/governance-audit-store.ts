import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type GovernanceAuditEventType =
  | "capability_request_created"
  | "capability_request_decided"
  | "agent_blueprint_created"
  | "agent_blueprint_decided"
  | "agent_registry_registered"
  | "agent_registry_status_changed";

export interface GovernanceAuditEvent {
  id: string;
  timestamp: string;
  type: GovernanceAuditEventType;
  actor: "agent-flow" | "manual-ui" | "api";
  entityType: "capability-request" | "agent-blueprint" | "agent-registry";
  entityId?: string;
  status?: string;
  previousStatus?: string;
  riskLevel?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
}
function auditPath(): string {
  return path.join(dataDir(), "governance-audit.jsonl");
}
function ensureStore(): void {
  mkdirSync(dataDir(), { recursive: true });
  try { readFileSync(auditPath(), "utf8"); } catch { appendFileSync(auditPath(), "", "utf8"); }
}
function eventId(type: string, timestamp: string): string {
  return "audit-" + type.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
export function appendGovernanceAuditEvent(input: Omit<GovernanceAuditEvent, "id" | "timestamp">): GovernanceAuditEvent {
  ensureStore();
  const timestamp = new Date().toISOString();
  const event: GovernanceAuditEvent = { id: eventId(input.type, timestamp), timestamp, ...input };
  appendFileSync(auditPath(), JSON.stringify(event) + "\n", "utf8");
  return event;
}
export function readGovernanceAuditEvents(limit = 250): GovernanceAuditEvent[] {
  ensureStore();
  const raw = readFileSync(auditPath(), "utf8");
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    try { return JSON.parse(line) as GovernanceAuditEvent; } catch { return null; }
  }).filter((entry): entry is GovernanceAuditEvent => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 1000)));
}
export function summarizeGovernanceAudit(events: GovernanceAuditEvent[]) {
  const byType: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byRiskLevel: Record<string, number> = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
    byEntityType[event.entityType] = (byEntityType[event.entityType] || 0) + 1;
    if (event.status) byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    if (event.riskLevel) byRiskLevel[event.riskLevel] = (byRiskLevel[event.riskLevel] || 0) + 1;
  }
  return { total: events.length, byType, byEntityType, byStatus, byRiskLevel };
}


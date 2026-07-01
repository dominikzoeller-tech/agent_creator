import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type CapabilityRequestStatus = "pending" | "approved" | "denied" | "implemented" | "expired";

export interface AgentFlowCapabilityRequest {
  id: string;
  status: CapabilityRequestStatus;
  requestedCapability: string;
  reason?: string;
  userInputPreview?: string;
  riskLevel?: "low" | "medium" | "high";
  source: "agent-flow";
  requestedAt: string;
  decidedAt?: string;
  decisionNote?: string;
  metadata?: Record<string, unknown>;
}

function getDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function getFilePath(): string {
  return path.join(getDataDir(), "tool-capability-requests.json");
}
function ensureStore(): void {
  mkdirSync(getDataDir(), { recursive: true });
  try { readFileSync(getFilePath(), "utf8"); } catch { writeFileSync(getFilePath(), "[]\n", "utf8"); }
}
function sanitizePreview(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, 240);
}
function readRequests(): AgentFlowCapabilityRequest[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is AgentFlowCapabilityRequest => Boolean(entry && typeof entry === "object" && typeof (entry as AgentFlowCapabilityRequest).id === "string")) : [];
  } catch { return []; }
}
function writeRequests(requests: AgentFlowCapabilityRequest[]): void {
  ensureStore();
  writeFileSync(getFilePath(), JSON.stringify(requests, null, 2) + "\n", "utf8");
}
function buildId(capability: string, timestamp: string): string {
  const slug = capability.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "capability";
  const compactTime = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `capability-${slug}-${compactTime}-${random}`;
}
export function inferMissingCapabilityRequest(userInput: string, candidateToolIds: string[] = []): { shouldCreate: boolean; requestedCapability: string; reason: string; riskLevel: "low" | "medium" | "high" } {
  const compact = userInput.toLowerCase();
  const mentionsNeed = /(tool|werkzeug|fähigkeit|capability|agent|sub-agent|bauen|erstellen|andocken|outlook|kalender|market|marktdaten|broker|portfolio|datei|excel|pdf|mail|email)/i.test(userInput);
  const explicitMissing = /(fehlt|nicht vorhanden|nicht verfügbar|brauch(e|st)?|benötig(e|st)?|kannst du.*bauen|baue.*agent|erstelle.*tool|missing)/i.test(userInput);
  if (candidateToolIds.length > 0 || !mentionsNeed || !explicitMissing) {
    return { shouldCreate: false, requestedCapability: "", reason: "Kein expliziter Missing-Capability-Fall erkannt.", riskLevel: "low" };
  }
  const requestedCapability = compact.includes("outlook") || compact.includes("mail") || compact.includes("email")
    ? "outlook-mail-calendar-capability"
    : compact.includes("market") || compact.includes("marktdaten") || compact.includes("portfolio") || compact.includes("broker")
      ? "market-portfolio-data-capability"
      : compact.includes("agent")
        ? "agent-blueprint-capability"
        : "custom-tool-capability";
  const riskLevel = /outlook|mail|email|broker|portfolio|schreiben|löschen|senden/i.test(userInput) ? "high" : "medium";
  return {
    shouldCreate: true,
    requestedCapability,
    riskLevel,
    reason: "Agent Flow erkennt eine explizit angefragte, aber nicht verfügbare Fähigkeit. Es wird nur ein Request erstellt; es wird kein Tool und kein Agent automatisch gebaut.",
  };
}
export function createAgentFlowCapabilityRequest(input: { requestedCapability: string; reason?: string; userInputPreview?: string; riskLevel?: "low" | "medium" | "high"; metadata?: Record<string, unknown>; }): AgentFlowCapabilityRequest {
  const requestedAt = new Date().toISOString();
  const requestedCapability = input.requestedCapability.trim() || "custom-tool-capability";
  const request: AgentFlowCapabilityRequest = {
    id: buildId(requestedCapability, requestedAt),
    status: "pending",
    requestedCapability,
    reason: input.reason || "Agent Flow fordert eine fehlende Fähigkeit an.",
    userInputPreview: sanitizePreview(input.userInputPreview),
    riskLevel: input.riskLevel || "medium",
    source: "agent-flow",
    requestedAt,
    metadata: { ...(input.metadata || {}), source: "agent-flow" },
  };
  writeRequests([request, ...readRequests()]);
  return request;
}

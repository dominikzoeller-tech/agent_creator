import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type AgentFlowToolConsentStatus = "pending" | "approved" | "denied" | "expired";

export interface AgentFlowToolConsentRequest {
  id: string;
  toolId: string;
  status: AgentFlowToolConsentStatus;
  reason?: string;
  userInputPreview?: string;
  sensitivity?: string;
  processingMode?: string;
  requestedAt: string;
  decidedAt?: string;
  expiresAt?: string;
  decisionNote?: string;
  metadata?: Record<string, unknown>;
}

function getConsentDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}

function getConsentFilePath(): string {
  return path.join(getConsentDataDir(), "tool-consent-requests.json");
}

function ensureStore(): void {
  mkdirSync(getConsentDataDir(), { recursive: true });
  const file = getConsentFilePath();
  try {
    readFileSync(file, "utf8");
  } catch {
    writeFileSync(file, "[]\n", "utf8");
  }
}

function sanitizePreview(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, 240);
}

function readRequests(): AgentFlowToolConsentRequest[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getConsentFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is AgentFlowToolConsentRequest => Boolean(entry && typeof entry === "object" && typeof (entry as AgentFlowToolConsentRequest).id === "string")) : [];
  } catch {
    return [];
  }
}

function writeRequests(requests: AgentFlowToolConsentRequest[]): void {
  ensureStore();
  writeFileSync(getConsentFilePath(), JSON.stringify(requests, null, 2) + "\n", "utf8");
}

function buildConsentId(toolId: string, timestamp: string): string {
  const slug = toolId.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "tool";
  const compactTime = timestamp.replace(/[^0-9]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `consent-${slug}-${compactTime}-${random}`;
}

export function createAgentFlowToolConsentRequest(input: {
  toolId: string;
  reason?: string;
  userInputPreview?: string;
  sensitivity?: string;
  processingMode?: string;
  ttlMinutes?: number;
  metadata?: Record<string, unknown>;
}): AgentFlowToolConsentRequest {
  const now = new Date();
  const requestedAt = now.toISOString();
  const ttlMinutes = Number.isFinite(input.ttlMinutes) ? Math.max(1, Math.min(Number(input.ttlMinutes), 24 * 60)) : 60;
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();
  const toolId = input.toolId.trim() || "unknown-tool";
  const request: AgentFlowToolConsentRequest = {
    id: buildConsentId(toolId, requestedAt),
    toolId,
    status: "pending",
    reason: input.reason || "Agent Flow fordert explizite Tool-Freigabe an.",
    userInputPreview: sanitizePreview(input.userInputPreview),
    sensitivity: input.sensitivity,
    processingMode: input.processingMode,
    requestedAt,
    expiresAt,
    metadata: { ...(input.metadata || {}), source: "agent-flow" },
  };
  const requests = readRequests();
  writeRequests([request, ...requests]);
  return request;
}


export function getAgentFlowToolConsentRequest(id: string): AgentFlowToolConsentRequest | null {
  const requestId = id.trim();
  if (!requestId) return null;
  const requests = readRequests();
  const request = requests.find((entry) => entry.id === requestId);
  if (!request) return null;
  if (request.status === "pending" && request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()) {
    request.status = "expired";
    request.decidedAt = new Date().toISOString();
    request.decisionNote = request.decisionNote || "Automatisch abgelaufen.";
    writeRequests(requests);
  }
  return request;
}

export function isAgentFlowToolConsentApproved(id: string | undefined, toolId?: string): boolean {
  if (!id) return false;
  const request = getAgentFlowToolConsentRequest(id);
  if (!request) return false;
  if (request.status !== "approved") return false;
  if (toolId && request.toolId !== toolId) return false;
  return true;
}

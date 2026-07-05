import fs from "fs";
import path from "path";

export type ToolConsentStatus = "pending" | "approved" | "denied" | "expired";

export interface ToolConsentRequest {
  id: string;
  toolId: string;
  status: ToolConsentStatus;
  reason: string;
  userInputPreview?: string;
  sensitivity?: string;
  processingMode?: string;
  requestedAt: string;
  decidedAt?: string;
  expiresAt?: string;
  decisionNote?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolConsentStoreResponse {
  ok: true;
  total: number;
  pending: number;
  approved: number;
  denied: number;
  expired: number;
  requests: ToolConsentRequest[];
}

const DATA_DIR = process.env.TOOL_CONSENT_DATA_DIR || path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "tool-consent-requests.json");

function ensureStoreFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, "[]\n", "utf8");
}

function readRequests(): ToolConsentRequest[] {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConsentRequest);
  } catch {
    return [];
  }
}

function writeRequests(requests: ToolConsentRequest[]) {
  ensureStoreFile();
  fs.writeFileSync(STORE_FILE, `${JSON.stringify(requests, null, 2)}\n`, "utf8");
}

function isConsentRequest(value: unknown): value is ToolConsentRequest {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.toolId === "string" && typeof item.status === "string" && typeof item.requestedAt === "string";
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizePreview(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_SECRET]")
    .replace(/\bsk-proj-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_SECRET]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .slice(0, 240);
}

export function listToolConsentRequests(): ToolConsentStoreResponse {
  const requests = expireOldRequests(readRequests()).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return {
    ok: true,
    total: requests.length,
    pending: requests.filter((request) => request.status === "pending").length,
    approved: requests.filter((request) => request.status === "approved").length,
    denied: requests.filter((request) => request.status === "denied").length,
    expired: requests.filter((request) => request.status === "expired").length,
    requests,
  };
}

export function createToolConsentRequest(input: {
  toolId: string;
  reason?: string;
  userInputPreview?: string;
  sensitivity?: string;
  processingMode?: string;
  metadata?: Record<string, unknown>;
  ttlMinutes?: number;
}): ToolConsentRequest {
  const ttlMinutes = Number.isFinite(input.ttlMinutes) && input.ttlMinutes && input.ttlMinutes > 0 ? input.ttlMinutes : 60;
  const requestedAt = nowIso();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const request: ToolConsentRequest = {
    id: createId(),
    toolId: input.toolId,
    status: "pending",
    reason: input.reason || "Tool-AusfÃ¼hrung benÃ¶tigt explizite BestÃ¤tigung.",
    userInputPreview: sanitizePreview(input.userInputPreview),
    sensitivity: input.sensitivity,
    processingMode: input.processingMode,
    requestedAt,
    expiresAt,
    metadata: input.metadata,
  };
  const requests = expireOldRequests(readRequests());
  requests.push(request);
  writeRequests(requests);
  return request;
}

export function decideToolConsentRequest(input: { id: string; status: "approved" | "denied"; decisionNote?: string }): ToolConsentRequest | null {
  const requests = expireOldRequests(readRequests());
  const index = requests.findIndex((request) => request.id === input.id);
  if (index === -1) return null;
  const current = requests[index];
  if (current.status !== "pending") return current;
  const updated: ToolConsentRequest = {
    ...current,
    status: input.status,
    decidedAt: nowIso(),
    decisionNote: input.decisionNote?.slice(0, 500),
  };
  requests[index] = updated;
  writeRequests(requests);
  return updated;
}

export function expireOldRequests(requests: ToolConsentRequest[]): ToolConsentRequest[] {
  const now = Date.now();
  let changed = false;
  const updated = requests.map((request) => {
    if (request.status !== "pending" || !request.expiresAt) return request;
    if (Date.parse(request.expiresAt) <= now) {
      changed = true;
      return { ...request, status: "expired" as ToolConsentStatus, decidedAt: nowIso(), decisionNote: "Automatisch abgelaufen." };
    }
    return request;
  });
  if (changed) writeRequests(updated);
  return updated;
}


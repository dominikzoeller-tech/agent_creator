import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ControlledAgentStatus = "registered" | "disabled" | "test_mode" | "active";
export interface ControlledAgentRegistryEntry {
  id: string;
  status: ControlledAgentStatus;
  agentName: string;
  purpose: string;
  source: "agent-blueprint" | "manual-ui";
  blueprintProposalId?: string;
  requestedCapability?: string;
  allowedTools: string[];
  permissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  createdAt: string;
  updatedAt: string;
  activationNote?: string;
  metadata?: Record<string, unknown>;
}
function getDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function getFilePath(): string {
  return path.join(getDataDir(), "controlled-agent-registry.json");
}
function ensureStore(): void {
  mkdirSync(getDataDir(), { recursive: true });
  try { readFileSync(getFilePath(), "utf8"); } catch { writeFileSync(getFilePath(), "[]\n", "utf8"); }
}
function readEntries(): ControlledAgentRegistryEntry[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is ControlledAgentRegistryEntry => Boolean(entry && typeof entry === "object" && typeof (entry as ControlledAgentRegistryEntry).id === "string")) : [];
  } catch { return []; }
}
function writeEntries(entries: ControlledAgentRegistryEntry[]): void {
  ensureStore();
  writeFileSync(getFilePath(), JSON.stringify(entries, null, 2) + "\n", "utf8");
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "controlled-agent";
}
function idFor(agentName: string, timestamp: string): string {
  return "agent-" + slug(agentName) + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14);
}
export function registerControlledAgentFromBlueprint(input: {
  agentName: string;
  purpose: string;
  blueprintProposalId?: string;
  requestedCapability?: string;
  allowedTools?: string[];
  permissions?: string[];
  riskLevel?: "low" | "medium" | "high";
  activationNote?: string;
  metadata?: Record<string, unknown>;
}): ControlledAgentRegistryEntry {
  const now = new Date().toISOString();
  const agentName = input.agentName.trim();
  if (!agentName) throw new Error("agentName ist erforderlich.");
  const entries = readEntries();
  const id = idFor(agentName, now);
  const entry: ControlledAgentRegistryEntry = {
    id,
    status: "test_mode",
    agentName,
    purpose: input.purpose || "Kontrolliert registrierter Agent aus Blueprint Proposal.",
    source: "agent-blueprint",
    blueprintProposalId: input.blueprintProposalId,
    requestedCapability: input.requestedCapability,
    allowedTools: input.allowedTools || [],
    permissions: input.permissions || [],
    riskLevel: input.riskLevel || "medium",
    requiresConsent: true,
    createdAt: now,
    updatedAt: now,
    activationNote: input.activationNote || "Registriert in Test Mode. Keine automatische Ausführung.",
    metadata: input.metadata,
  };
  writeEntries([entry, ...entries]);
  return entry;
}
export function listControlledAgentRegistryEntries(): ControlledAgentRegistryEntry[] {
  return readEntries().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

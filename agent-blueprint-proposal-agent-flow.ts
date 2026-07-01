import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type AgentBlueprintProposalStatus = "draft" | "pending_review" | "approved" | "denied" | "activated";

export interface AgentBlueprintProposal {
  id: string;
  status: AgentBlueprintProposalStatus;
  agentName: string;
  purpose: string;
  source: "agent-flow" | "manual-ui" | "capability-request";
  capabilityRequestId?: string;
  requestedCapability?: string;
  proposedTools: string[];
  proposedPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string;
  metadata?: Record<string, unknown>;
}

function getDataDir(): string {
  return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "data");
}
function getFilePath(): string {
  return path.join(getDataDir(), "agent-blueprint-proposals.json");
}
function ensureStore(): void {
  mkdirSync(getDataDir(), { recursive: true });
  try { readFileSync(getFilePath(), "utf8"); } catch { writeFileSync(getFilePath(), "[]\n", "utf8"); }
}
function readProposals(): AgentBlueprintProposal[] {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(getFilePath(), "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is AgentBlueprintProposal => Boolean(entry && typeof entry === "object" && typeof (entry as AgentBlueprintProposal).id === "string")) : [];
  } catch { return []; }
}
function writeProposals(proposals: AgentBlueprintProposal[]): void {
  ensureStore();
  writeFileSync(getFilePath(), JSON.stringify(proposals, null, 2) + "\n", "utf8");
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "agent-blueprint";
}
function buildId(agentName: string, timestamp: string): string {
  return "blueprint-" + slug(agentName) + "-" + timestamp.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8);
}
function inferNameFromCapability(capability: string): string {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return "OutlookWorkflowAgent";
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return "MarketPortfolioAnalysisAgent";
  if (compact.includes("blueprint") || compact.includes("agent")) return "AgentBlueprintPlanningAgent";
  return "CustomCapabilityAgent";
}
function inferToolsFromCapability(capability: string): string[] {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return ["outlook-mail-read", "outlook-calendar-read", "draft-response-generator"];
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return ["market-data-reader", "portfolio-analyzer", "risk-calculator"];
  return ["capability-analyzer", "report-generator"];
}
function inferPermissionsFromCapability(capability: string): string[] {
  const compact = capability.toLowerCase();
  if (compact.includes("outlook") || compact.includes("mail") || compact.includes("calendar")) return ["read_mail_metadata", "read_calendar_metadata", "create_drafts_after_consent"];
  if (compact.includes("market") || compact.includes("portfolio") || compact.includes("broker")) return ["read_uploaded_files", "read_market_data", "create_reports"];
  return ["read_context", "create_blueprint_report"];
}
function inferRiskFromCapability(capability: string): "low" | "medium" | "high" {
  return /outlook|mail|email|calendar|broker|portfolio|write|send|delete|löschen|senden/i.test(capability) ? "high" : "medium";
}
export function inferAgentBlueprintProposal(input: { userInput?: string; requestedCapability?: string; capabilityRequestId?: string }): { shouldCreate: boolean; requestedCapability: string; reason: string } {
  const text = String(input.userInput || "");
  const capability = String(input.requestedCapability || "").trim();
  const wantsBlueprint = /(blueprint|agent[- ]?blueprint|agent vorschlag|agent proposal|spezialagent|agent planen|agent entwerfen)/i.test(text);
  if (!wantsBlueprint && !capability) return { shouldCreate: false, requestedCapability: "", reason: "Kein Agent Blueprint Proposal angefragt." };
  return { shouldCreate: true, requestedCapability: capability || "custom-tool-capability", reason: "Kontrollierter Agent Blueprint Proposal Flow. Es wird nur ein Vorschlag erzeugt, kein Agent aktiviert." };
}
export function createAgentBlueprintProposal(input: { requestedCapability: string; capabilityRequestId?: string; userInput?: string; source?: "agent-flow" | "manual-ui" | "capability-request"; metadata?: Record<string, unknown>; }): AgentBlueprintProposal {
  const now = new Date().toISOString();
  const requestedCapability = input.requestedCapability.trim() || "custom-tool-capability";
  const agentName = inferNameFromCapability(requestedCapability);
  const proposal: AgentBlueprintProposal = {
    id: buildId(agentName, now),
    status: "pending_review",
    agentName,
    purpose: "Vorgeschlagener Spezialagent für Capability: " + requestedCapability + ". Der Blueprint dient nur der Prüfung und aktiviert keine Ausführung.",
    source: input.source || "agent-flow",
    capabilityRequestId: input.capabilityRequestId,
    requestedCapability,
    proposedTools: inferToolsFromCapability(requestedCapability),
    proposedPermissions: inferPermissionsFromCapability(requestedCapability),
    riskLevel: inferRiskFromCapability(requestedCapability),
    requiresConsent: true,
    createdAt: now,
    metadata: { ...(input.metadata || {}), source: input.source || "agent-flow" },
  };
  writeProposals([proposal, ...readProposals()]);
  return proposal;
}

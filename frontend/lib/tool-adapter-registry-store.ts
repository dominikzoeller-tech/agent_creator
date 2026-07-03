import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type ToolAdapterStatus = "draft" | "registered" | "disabled" | "test_mode";
export type ToolExecutionPlanDecision = "plan_created" | "blocked_missing_adapter" | "blocked_disabled" | "blocked_unsafe_input" | "blocked_permission" | "consent_required";

export interface ToolAdapterRegistryEntry {
  id: string;
  status: ToolAdapterStatus;
  adapterName: string;
  displayName: string;
  purpose: string;
  allowedInputKeys: string[];
  allowedOutputKeys: string[];
  requiredPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  requiresConsent: boolean;
  executionMode: "dry_run_only";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionSandboxPlan {
  id: string;
  timestamp: string;
  adapterId?: string;
  adapterName?: string;
  requestedAction: string;
  sanitizedInput: Record<string, unknown>;
  rejectedInputKeys: string[];
  allowedOutputKeys: string[];
  requiredPermissions: string[];
  decision: ToolExecutionPlanDecision;
  requiresConsent: boolean;
  consentRequired: boolean;
  toolExecutionAllowed: false;
  dryRunOnly: true;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function registryPath(): string { return path.join(dataDir(), "tool-adapter-registry.json"); }
function plansPath(): string { return path.join(dataDir(), "tool-execution-sandbox-plans.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); try { readFileSync(registryPath(), "utf8"); } catch { writeFileSync(registryPath(), "[]\n", "utf8"); } }
function readRegistry(): ToolAdapterRegistryEntry[] { ensureStore(); try { const parsed = JSON.parse(readFileSync(registryPath(), "utf8")); return Array.isArray(parsed) ? parsed.filter((entry:any)=>entry && typeof entry.id === "string") : []; } catch { return []; } }
function writeRegistry(entries: ToolAdapterRegistryEntry[]): void { ensureStore(); writeFileSync(registryPath(), JSON.stringify(entries, null, 2) + "\n", "utf8"); }
function readPlans(limit = 100): ToolExecutionSandboxPlan[] { ensureStore(); try { return readFileSync(plansPath(), "utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line) as ToolExecutionSandboxPlan; } catch { return null; } }).filter((entry): entry is ToolExecutionSandboxPlan => Boolean(entry)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0, Math.max(1, Math.min(limit, 500))); } catch { return []; } }
function appendPlan(plan: ToolExecutionSandboxPlan): void { ensureStore(); appendFileSync(plansPath(), JSON.stringify(plan) + "\n", "utf8"); }
function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9äöüß_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "tool-adapter"; }
function makeId(prefix: string, value?: string): string { const now = new Date().toISOString(); return prefix + "-" + slug(value || prefix) + "-" + now.replace(/[^0-9]/g, "").slice(0,14) + "-" + Math.random().toString(36).slice(2,8); }
function redact(value: unknown): unknown { if(typeof value !== "string") return value; return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]").slice(0, 500); }
function normalizeList(value: unknown): string[] { if(Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item)=>item.trim()).filter(Boolean); if(typeof value === "string") return value.split(",").map((item)=>item.trim()).filter(Boolean); return []; }

export function listToolAdapters(): ToolAdapterRegistryEntry[] { return readRegistry().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
export function registerToolAdapter(input: { adapterName: string; displayName?: string; purpose: string; allowedInputKeys?: unknown; allowedOutputKeys?: unknown; requiredPermissions?: unknown; riskLevel?: "low"|"medium"|"high"; requiresConsent?: boolean; metadata?: Record<string, unknown>; }): ToolAdapterRegistryEntry {
  const now = new Date().toISOString();
  const adapterName = input.adapterName.trim();
  if(!adapterName) throw new Error("adapterName ist erforderlich.");
  const entry: ToolAdapterRegistryEntry = {
    id: makeId("tool-adapter", adapterName),
    status: "test_mode",
    adapterName,
    displayName: input.displayName || adapterName,
    purpose: input.purpose || "Controlled Tool Adapter im Dry-run-Modus.",
    allowedInputKeys: normalizeList(input.allowedInputKeys),
    allowedOutputKeys: normalizeList(input.allowedOutputKeys),
    requiredPermissions: normalizeList(input.requiredPermissions),
    riskLevel: input.riskLevel || "medium",
    requiresConsent: input.requiresConsent !== false,
    executionMode: "dry_run_only",
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata,
  };
  writeRegistry([entry, ...readRegistry()]);
  return entry;
}
export function updateToolAdapterStatus(input: { id: string; status: ToolAdapterStatus }): ToolAdapterRegistryEntry | null {
  const entries = readRegistry();
  const index = entries.findIndex((entry)=>entry.id === input.id);
  if(index < 0) return null;
  entries[index] = { ...entries[index], status: input.status, updatedAt: new Date().toISOString() };
  writeRegistry(entries);
  return entries[index];
}
export function createToolExecutionSandboxPlan(input: { adapterId?: string; adapterName?: string; requestedAction: string; input?: Record<string, unknown>; grantedPermissions?: string[]; metadata?: Record<string, unknown>; }): ToolExecutionSandboxPlan {
  const registry = readRegistry();
  const adapter = registry.find((entry) => (input.adapterId && entry.id === input.adapterId) || (input.adapterName && entry.adapterName === input.adapterName));
  const rawInput = input.input || {};
  const sanitizedInput: Record<string, unknown> = {};
  const rejectedInputKeys: string[] = [];
  const allowedInputKeys = adapter?.allowedInputKeys || [];
  for(const [key, value] of Object.entries(rawInput)) {
    if(allowedInputKeys.includes(key)) sanitizedInput[key] = redact(value);
    else rejectedInputKeys.push(key);
  }
  const grantedPermissions = input.grantedPermissions || [];
  const requiredPermissions = adapter?.requiredPermissions || [];
  const missingPermissions = requiredPermissions.filter((permission) => !grantedPermissions.includes(permission));
  let decision: ToolExecutionPlanDecision = "plan_created";
  let reason = "Dry-run Tool Execution Plan erstellt. Keine echte Tool-Ausführung erlaubt.";
  if(!adapter) { decision = "blocked_missing_adapter"; reason = "Tool Adapter nicht gefunden."; }
  else if(adapter.status === "disabled") { decision = "blocked_disabled"; reason = "Tool Adapter ist disabled."; }
  else if(rejectedInputKeys.length > 0) { decision = "blocked_unsafe_input"; reason = "Input enthält nicht erlaubte Keys."; }
  else if(missingPermissions.length > 0) { decision = "blocked_permission"; reason = "Erforderliche Permissions fehlen."; }
  else if(adapter.requiresConsent !== false) { decision = "consent_required"; reason = "Consent wäre vor echter Tool-Ausführung erforderlich; Phase 13.0 erlaubt nur Dry-run Plan."; }
  const plan: ToolExecutionSandboxPlan = {
    id: makeId("tool-plan", adapter?.adapterName || input.adapterName || input.adapterId || "unknown"),
    timestamp: new Date().toISOString(),
    adapterId: adapter?.id || input.adapterId,
    adapterName: adapter?.adapterName || input.adapterName,
    requestedAction: input.requestedAction,
    sanitizedInput,
    rejectedInputKeys,
    allowedOutputKeys: adapter?.allowedOutputKeys || [],
    requiredPermissions,
    decision,
    requiresConsent: adapter?.requiresConsent !== false,
    consentRequired: adapter?.requiresConsent !== false,
    toolExecutionAllowed: false,
    dryRunOnly: true,
    reason,
    metadata: { ...(input.metadata || {}), missingPermissions, phase: "13.0" },
  };
  appendPlan(plan);
  return plan;
}
export function listToolExecutionSandboxPlans(limit = 100): ToolExecutionSandboxPlan[] { return readPlans(limit); }
export function summarizeToolSandboxPlans(plans: ToolExecutionSandboxPlan[]) { const byDecision: Record<string, number> = {}; for(const plan of plans) byDecision[plan.decision] = (byDecision[plan.decision] || 0) + 1; return { total: plans.length, byDecision }; }
export function summarizeToolAdapters(entries: ToolAdapterRegistryEntry[]) { const byStatus: Record<string, number> = {}; const byRiskLevel: Record<string, number> = {}; for(const entry of entries){ byStatus[entry.status] = (byStatus[entry.status] || 0) + 1; byRiskLevel[entry.riskLevel] = (byRiskLevel[entry.riskLevel] || 0) + 1; } return { total: entries.length, byStatus, byRiskLevel }; }

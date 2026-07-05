const fs = require("fs");
const path = require("path");

function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }
function ensure(file, content){ if(!exists(file)) write(file, content); else console.log("SKIP " + file); }

function patchPackage(){
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase41:0:patch"] = "node scripts/phase41-0-patch-provider-dispatch-approval-candidate-envelope.cjs";
  pkg.scripts["phase41:0:verify"] = "node scripts/phase41-0-verify-provider-dispatch-approval-candidate-envelope.cjs";
  pkg.scripts["llm:provider-dispatch-approval-candidate-envelope:verify"] = "node scripts/phase41-0-verify-provider-dispatch-approval-candidate-envelope.cjs";
  write(file, JSON.stringify(pkg, null, 2) + "\n");
}

const store = `import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ProviderDispatchApprovalCandidateEnvelopeDecision =
  | "provider_dispatch_approval_candidate_envelope_prepared_no_provider_call"
  | "blocked_missing_release_candidate_envelope"
  | "blocked_release_candidate_not_human_review_ready"
  | "blocked_release_candidate_approved_or_executed"
  | "blocked_release_candidate_contains_provider_response"
  | "blocked_release_candidate_contains_prompt_payload"
  | "blocked_release_candidate_contains_secrets"
  | "blocked_execution_or_dispatch_enabled"
  | "blocked_network_or_provider_execution_attempt";

export interface ProviderDispatchApprovalCandidateEnvelope {
  id: string;
  timestamp: string;
  providerDispatchReleaseCandidateEnvelopeId?: string;
  providerDispatchTranscriptEnvelopeId?: string;
  decision: ProviderDispatchApprovalCandidateEnvelopeDecision;
  envelopeMode: "controlled_provider_dispatch_approval_candidate_envelope_no_provider_call";
  providerDispatchApprovalCandidateEnvelopePrepared: true;
  approvalCandidateEnvelopePrepared: true;
  approvalCandidateEnvelopePersisted: true;
  approvalCandidateReadyForHumanApproval: true;
  approvalCandidateApproved: false;
  approvalCandidateExecuted: false;
  approvalCandidateContainsProviderResponse: false;
  approvalCandidateContainsPromptPayload: false;
  approvalCandidateContainsSecrets: false;
  releaseCandidateReadyForHumanReview: true;
  releaseCandidateApproved: false;
  releaseCandidateExecuted: false;
  releaseCandidateContainsProviderResponse: false;
  releaseCandidateContainsPromptPayload: false;
  releaseCandidateContainsSecrets: false;
  finalDispatchAllowed: false;
  providerDispatchPerformed: false;
  commandEnvelopeExecuted: false;
  executionGateOpen: false;
  metadataOnly: true;
  provider: "none";
  modelSelected: "none";
  promptPayloadIncluded: false;
  promptIncluded: false;
  providerResponseIncluded: false;
  providerResultIncluded: false;
  secretValuesIncluded: false;
  requestBodyIncluded: false;
  sensitiveRequestBodyIncluded: false;
  networkCallAllowed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}

function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function releaseCandidatePath(): string { return path.join(dataDir(), "provider-dispatch-release-candidate-envelopes.jsonl"); }
function approvalCandidatePath(): string { return path.join(dataDir(), "provider-dispatch-approval-candidate-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file: string): any[] {
  try {
    return readFileSync(file, "utf8").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}
function makeId(prefix: string): string { return prefix + "-" + new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 8); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\\s*[:=]\\s*[^\\s,;]+|token\\s*[:=]\\s*[^\\s,;]+|secret\\s*[:=]\\s*[^\\s,;]+|password\\s*[:=]\\s*[^\\s,;]+)/i.test(JSON.stringify(value || {})); }
function appendEnvelope(envelope: ProviderDispatchApprovalCandidateEnvelope): void { ensureStore(); appendFileSync(approvalCandidatePath(), JSON.stringify(envelope) + "\\n", "utf8"); }

export function listProviderDispatchApprovalCandidateEnvelopes(limit = 100): ProviderDispatchApprovalCandidateEnvelope[] {
  ensureStore();
  return readJsonl(approvalCandidatePath()).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit, 500)));
}

export function createProviderDispatchApprovalCandidateEnvelope(input: { providerDispatchReleaseCandidateEnvelopeId?: string; metadata?: Record<string, unknown> }): ProviderDispatchApprovalCandidateEnvelope {
  ensureStore();
  const candidates = readJsonl(releaseCandidatePath());
  const release = input.providerDispatchReleaseCandidateEnvelopeId ? candidates.find((entry: any) => entry.id === input.providerDispatchReleaseCandidateEnvelopeId) : candidates[0];

  let decision: ProviderDispatchApprovalCandidateEnvelopeDecision = "provider_dispatch_approval_candidate_envelope_prepared_no_provider_call";
  let reason = "Provider Dispatch Approval Candidate Envelope wurde nur vorbereitet. Es ist bereit für Human Approval, aber nicht approved und nicht ausgeführt. Kein Provider-/Netzwerk-Aufruf.";

  if (!release) { decision = "blocked_missing_release_candidate_envelope"; reason = "Release Candidate Envelope fehlt."; }
  else if (release.releaseCandidateReadyForHumanReview !== true) { decision = "blocked_release_candidate_not_human_review_ready"; reason = "Release Candidate ist nicht Human-Review-ready."; }
  else if (release.releaseCandidateApproved !== false || release.releaseCandidateExecuted !== false) { decision = "blocked_release_candidate_approved_or_executed"; reason = "Release Candidate wurde approved oder ausgeführt."; }
  else if (release.releaseCandidateContainsProviderResponse !== false || release.providerResponseIncluded !== false || release.providerResultIncluded !== false) { decision = "blocked_release_candidate_contains_provider_response"; reason = "Release Candidate enthält Provider Response oder Provider Result."; }
  else if (release.releaseCandidateContainsPromptPayload !== false || release.promptPayloadIncluded !== false || release.promptIncluded !== false) { decision = "blocked_release_candidate_contains_prompt_payload"; reason = "Release Candidate enthält Prompt Payload."; }
  else if (release.releaseCandidateContainsSecrets !== false || release.secretValuesIncluded !== false || release.noSecretsIncluded !== true || containsSecretValue(release)) { decision = "blocked_release_candidate_contains_secrets"; reason = "Release Candidate enthält Secrets."; }
  else if (release.finalDispatchAllowed !== false || release.providerDispatchPerformed !== false || release.commandEnvelopeExecuted !== false || release.executionGateOpen !== false) { decision = "blocked_execution_or_dispatch_enabled"; reason = "Dispatch oder Execution ist aktiv."; }
  else if (release.networkCallAllowed !== false || release.networkCallPerformed !== false || release.providerExecutionAllowed !== false || release.llmCallPerformed !== false) { decision = "blocked_network_or_provider_execution_attempt"; reason = "Netzwerk-/Provider-Ausführung erkannt."; }

  const envelope: ProviderDispatchApprovalCandidateEnvelope = {
    id: makeId("provider-dispatch-approval-candidate-envelope"),
    timestamp: new Date().toISOString(),
    providerDispatchReleaseCandidateEnvelopeId: release?.id || input.providerDispatchReleaseCandidateEnvelopeId,
    providerDispatchTranscriptEnvelopeId: release?.providerDispatchTranscriptEnvelopeId,
    decision,
    envelopeMode: "controlled_provider_dispatch_approval_candidate_envelope_no_provider_call",
    providerDispatchApprovalCandidateEnvelopePrepared: true,
    approvalCandidateEnvelopePrepared: true,
    approvalCandidateEnvelopePersisted: true,
    approvalCandidateReadyForHumanApproval: true,
    approvalCandidateApproved: false,
    approvalCandidateExecuted: false,
    approvalCandidateContainsProviderResponse: false,
    approvalCandidateContainsPromptPayload: false,
    approvalCandidateContainsSecrets: false,
    releaseCandidateReadyForHumanReview: true,
    releaseCandidateApproved: false,
    releaseCandidateExecuted: false,
    releaseCandidateContainsProviderResponse: false,
    releaseCandidateContainsPromptPayload: false,
    releaseCandidateContainsSecrets: false,
    finalDispatchAllowed: false,
    providerDispatchPerformed: false,
    commandEnvelopeExecuted: false,
    executionGateOpen: false,
    metadataOnly: true,
    provider: "none",
    modelSelected: "none",
    promptPayloadIncluded: false,
    promptIncluded: false,
    providerResponseIncluded: false,
    providerResultIncluded: false,
    secretValuesIncluded: false,
    requestBodyIncluded: false,
    sensitiveRequestBodyIncluded: false,
    networkCallAllowed: false,
    networkCallPerformed: false,
    providerExecutionAllowed: false,
    realLlmCallAllowed: false,
    llmCallPerformed: false,
    executionAllowed: false,
    toolExecutionAllowed: false,
    agentExecutionAllowed: false,
    dryRunOnly: true,
    noSecretsIncluded: decision !== "blocked_release_candidate_contains_secrets",
    reason,
    metadata: { ...(input.metadata || {}), phase: "41.0", noProviderCall: true, noNetworkCall: true, noDispatch: true, approvalCandidateReadyForHumanApproval: true, approvalCandidateApproved: false, approvalCandidateExecuted: false }
  };

  appendEnvelope(envelope);
  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: envelope.providerDispatchReleaseCandidateEnvelopeId,
    status: envelope.decision,
    riskLevel: "critical",
    summary: "Provider Dispatch Approval Candidate Envelope: " + envelope.decision,
    metadata: { source: "phase41.0-provider-dispatch-approval-candidate-envelope", envelopeId: envelope.id, approvalCandidateApproved: false, approvalCandidateExecuted: false, networkCallAllowed: false, networkCallPerformed: false, providerExecutionAllowed: false, llmCallPerformed: false }
  });
  return envelope;
}

export function summarizeProviderDispatchApprovalCandidateEnvelopes(envelopes: ProviderDispatchApprovalCandidateEnvelope[]) {
  const byDecision: Record<string, number> = {};
  for (const item of envelopes) byDecision[item.decision] = (byDecision[item.decision] || 0) + 1;
  return { total: envelopes.length, byDecision };
}
`;

const api = `import { createProviderDispatchApprovalCandidateEnvelope, listProviderDispatchApprovalCandidateEnvelopes, summarizeProviderDispatchApprovalCandidateEnvelopes } from "../../../lib/provider-dispatch-approval-candidate-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const providerDispatchApprovalCandidateEnvelopes = listProviderDispatchApprovalCandidateEnvelopes(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok: true, summary: summarizeProviderDispatchApprovalCandidateEnvelopes(providerDispatchApprovalCandidateEnvelopes), providerDispatchApprovalCandidateEnvelopes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider Dispatch Approval Candidate Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const envelope = createProviderDispatchApprovalCandidateEnvelope({ providerDispatchReleaseCandidateEnvelopeId: typeof body.providerDispatchReleaseCandidateEnvelopeId === "string" ? body.providerDispatchReleaseCandidateEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok: true, envelope });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider Dispatch Approval Candidate Envelope konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
`;

const page = `"use client";
import { useEffect, useState } from "react";
import { UnifiedNavigation } from "../../components/UnifiedNavigation";

type ReleaseCandidate = { id: string; decision: string; timestamp: string; envelopeMode: string };
type ApprovalCandidate = { id: string; timestamp: string; decision: string; reason: string; envelopeMode: string; providerDispatchApprovalCandidateEnvelopePrepared: boolean; approvalCandidateReadyForHumanApproval: boolean; approvalCandidateApproved: boolean; approvalCandidateExecuted: boolean; approvalCandidateContainsProviderResponse: boolean; approvalCandidateContainsPromptPayload: boolean; approvalCandidateContainsSecrets: boolean; networkCallPerformed: boolean; providerExecutionAllowed: boolean; llmCallPerformed: boolean; dryRunOnly: boolean };

export default function ProviderDispatchApprovalCandidateEnvelopePage() {
  const [releaseCandidates, setReleaseCandidates] = useState<ReleaseCandidate[]>([]);
  const [approvalCandidates, setApprovalCandidates] = useState<ApprovalCandidate[]>([]);
  const [summary, setSummary] = useState<unknown>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [rRes, aRes] = await Promise.all([
        fetch("/api/provider-dispatch-release-candidate-envelope?limit=100", { cache: "no-store" }),
        fetch("/api/provider-dispatch-approval-candidate-envelope?limit=100", { cache: "no-store" })
      ]);
      const r = await rRes.json();
      const a = await aRes.json();
      if (rRes.ok) {
        const list = Array.isArray(r.providerDispatchReleaseCandidateEnvelopes) ? r.providerDispatchReleaseCandidateEnvelopes : [];
        setReleaseCandidates(list);
        if (!selected && list[0]?.id) setSelected(list[0].id);
      }
      if (!aRes.ok) throw new Error(a?.error || "Approval Candidate Envelopes konnten nicht geladen werden.");
      setApprovalCandidates(Array.isArray(a.providerDispatchApprovalCandidateEnvelopes) ? a.providerDispatchApprovalCandidateEnvelopes : []);
      setSummary(a.summary || null);
    } catch (err) { setError(err instanceof Error ? err.message : "Unbekannter Fehler"); }
  }

  useEffect(() => { load(); }, []);

  async function createEnvelope() {
    const res = await fetch("/api/provider-dispatch-approval-candidate-envelope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerDispatchReleaseCandidateEnvelopeId: selected }) });
    if (!res.ok) { const p = await res.json(); setError(p?.error || "Approval Candidate Envelope fehlgeschlagen"); }
    await load();
  }

  return <main className="page-wrap"><UnifiedNavigation active="provider-dispatch-approval-candidate-envelope" /><div className="page-shell"><section className="hero-card"><h1 className="section-title">Provider Dispatch Approval Candidate Envelope</h1><p style={{ lineHeight: 1.6 }}>Phase 41.0 bereitet ein Provider Dispatch Approval Candidate Envelope vor. Es ist nur bereit für Human Approval, nicht approved und nicht ausgeführt. Kein Provider Dispatch und kein Provider-/Netzwerk-Aufruf.</p></section>{error ? <section className="panel-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}<section className="panel-card"><h2>Approval Candidate Envelope vorbereiten</h2><select className="text-input" value={selected} onChange={(ev) => setSelected(ev.target.value)}>{releaseCandidates.map((item) => <option key={item.id} value={item.id}>{item.envelopeMode} · {item.decision} · {item.id}</option>)}</select><button className="primary-button" type="button" onClick={createEnvelope} disabled={!selected}>Provider Dispatch Approval Candidate Envelope vorbereiten</button></section><section className="panel-card"><h2>Summary</h2><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(summary ?? {}, null, 2)}</pre></section><section className="panel-card"><h2>Approval Candidate Envelopes</h2>{approvalCandidates.length === 0 ? <p>Noch keine Approval Candidate Envelopes.</p> : approvalCandidates.map((item) => <article key={item.id} style={{ borderTop: "1px solid #e5e7eb", padding: "12px 0" }}><div><strong>{item.envelopeMode}</strong> <span className="chip">{item.decision}</span></div><div className="helper-text"><code>{item.id}</code> · {item.timestamp}</div><p><strong>Reason:</strong> {item.reason}</p><p><strong>Prepared:</strong> {String(item.providerDispatchApprovalCandidateEnvelopePrepared)} · <strong>Human approval:</strong> {String(item.approvalCandidateReadyForHumanApproval)} · <strong>Approved:</strong> {String(item.approvalCandidateApproved)} · <strong>Executed:</strong> {String(item.approvalCandidateExecuted)}</p><p><strong>Provider response:</strong> {String(item.approvalCandidateContainsProviderResponse)} · <strong>Prompt payload:</strong> {String(item.approvalCandidateContainsPromptPayload)} · <strong>Secrets:</strong> {String(item.approvalCandidateContainsSecrets)} · <strong>Network call:</strong> {String(item.networkCallPerformed)} · <strong>Provider execution:</strong> {String(item.providerExecutionAllowed)} · <strong>LLM Call:</strong> {String(item.llmCallPerformed)} · <strong>Dry-run:</strong> {String(item.dryRunOnly)}</p></article>)}</section></div></main>;
}
`;

function patchNavigation(){
  const file = "frontend/components/UnifiedNavigation.tsx";
  if (!exists(file)) return;
  let content = read(file);
  if (content.includes("provider-dispatch-approval-candidate-envelope")) return;
  const marker = '  { href: "/provider-dispatch-approval-candidate-envelope", label: "Dispatch Approval Candidate", key: "provider-dispatch-approval-candidate-envelope" },';
  const lines = content.split(/\r?\n/);
  let idx = lines.findIndex((line) => line.includes("provider-dispatch-release-candidate-envelope"));
  if (idx < 0) idx = lines.findIndex((line) => line.includes("href:"));
  if (idx >= 0) lines.splice(idx + 1, 0, marker);
  else lines.push(marker);
  write(file, lines.join("\n"));
}

function patchDocs(){
  ensure("phase41-0-provider-dispatch-approval-candidate-envelope.md", `# Phase 41.0 – Controlled Provider Dispatch Approval Candidate Envelope / Still No Provider Call\n\n## Ziel\nEin Provider Dispatch Approval Candidate Envelope wird vorbereitet und persistiert. Es ist nur bereit für Human Approval, nicht approved und nicht ausgeführt. Kein Dispatch und kein Provider-/Netzwerk-Aufruf.\n\n## UI/API\n- UI: /provider-dispatch-approval-candidate-envelope\n- API: /api/provider-dispatch-approval-candidate-envelope\n\n## Sicherheitsinvarianten\n- providerDispatchApprovalCandidateEnvelopePrepared=true\n- approvalCandidateEnvelopePrepared=true\n- approvalCandidateEnvelopePersisted=true\n- approvalCandidateReadyForHumanApproval=true\n- approvalCandidateApproved=false\n- approvalCandidateExecuted=false\n- approvalCandidateContainsProviderResponse=false\n- approvalCandidateContainsPromptPayload=false\n- approvalCandidateContainsSecrets=false\n- releaseCandidateReadyForHumanReview=true\n- releaseCandidateApproved=false\n- releaseCandidateExecuted=false\n- networkCallAllowed=false\n- networkCallPerformed=false\n- providerExecutionAllowed=false\n- realLlmCallAllowed=false\n- llmCallPerformed=false\n- dryRunOnly=true\n\n## Nächster Schritt\nPhase 41.1 – Provider Dispatch Approval Candidate Envelope Policy & Audit\n`);
  ensure("docs/phase41-provider-dispatch-approval-candidate-envelope-runbook.md", `# Runbook – Phase 41.0 Provider Dispatch Approval Candidate Envelope\n\n## Patch\n\`\`\`powershell\nnpm run phase41:0:patch\n\`\`\`\n\n## Verify\n\`\`\`powershell\nnpm run phase41:0:verify\nnpm run build\n\`\`\`\n`);
}

patchPackage();
write("frontend/lib/provider-dispatch-approval-candidate-envelope-store.ts", store);
write("frontend/app/api/provider-dispatch-approval-candidate-envelope/route.ts", api);
write("frontend/app/provider-dispatch-approval-candidate-envelope/page.tsx", page);
patchNavigation();
patchDocs();
console.log("Phase 41.0 Patch abgeschlossen.");

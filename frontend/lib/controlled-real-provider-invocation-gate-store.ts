import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ControlledRealProviderInvocationGateDecision =
  | "real_provider_invocation_gate_prepared_human_approval_required"
  | "blocked_missing_simulation_envelope"
  | "blocked_auto_provider_call_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_real_llm_allowed_without_approval"
  | "blocked_execution_not_safe"
  | "blocked_output_contract_violation"
  | "blocked_operational_controls_violation";

export interface ControlledRealProviderInvocationGate {
  id: string;
  timestamp: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ControlledRealProviderInvocationGateDecision;
  gateMode: "controlled_real_provider_invocation_gate_human_approval_required";
  approvalState: {
    humanApprovalRequired: true;
    humanApproved: false;
    approvalTokenIssued: false;
    approvalTokenId?: string;
  };
  gateChecks: Array<{ name: string; passed: boolean; reason: string }>;
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
    manualApprovalRequiredBeforeAnyExternalCall: true;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  outputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
  };
  realLlmCallAllowed: false;
  llmCallPerformed: false;
  networkCallPerformed: false;
  providerExecutionAllowed: false;
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function simulationEnvelopePath(): string { return path.join(dataDir(), "controlled-provider-invocation-simulation-envelopes.jsonl"); }
function gatePath(): string { return path.join(dataDir(), "controlled-real-provider-invocation-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate: ControlledRealProviderInvocationGate): void { ensureStore(); appendFileSync(gatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listControlledRealProviderInvocationGates(limit=100): ControlledRealProviderInvocationGate[] { ensureStore(); return readJsonl(gatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledRealProviderInvocationGate(input:{ simulationEnvelopeId?: string; metadata?: Record<string, unknown> }): ControlledRealProviderInvocationGate {
  ensureStore();
  const envelopes=readJsonl(simulationEnvelopePath());
  const envelope=input.simulationEnvelopeId ? envelopes.find((entry:any)=>entry.id===input.simulationEnvelopeId) : envelopes[0];
  const request=envelope?.simulatedProviderRequest || {};
  const output=envelope?.outputContract || {};
  const defaults=envelope?.operationalMetadata || {};
  const checks:Array<{name:string; passed:boolean; reason:string}>=[];
  checks.push({ name:"simulation_envelope_exists", passed:Boolean(envelope), reason: envelope ? "Simulation Envelope gefunden." : "Simulation Envelope fehlt." });
  checks.push({ name:"simulation_no_external_call", passed:envelope?.simulationMode === "controlled_provider_invocation_simulation_envelope_no_external_call", reason:"Simulation Envelope muss no-external-call bleiben." });
  checks.push({ name:"human_approval_required", passed:true, reason:"Human Approval ist vor jedem echten externen Provider Call zwingend." });
  checks.push({ name:"human_not_approved_yet", passed:true, reason:"Dieses Gate erteilt noch keine Approval und gibt keinen Approval Token aus." });
  checks.push({ name:"provider_selection_blocked", passed:request.provider === "none" && request.modelSelected === "none", reason:"Provider und Modell bleiben im Gate blockiert." });
  checks.push({ name:"automatic_invocation_blocked", passed:request.networkCallAllowed === false && envelope?.networkCallPerformed === false && envelope?.providerExecutionAllowed === false, reason:"Automatischer Provider-/Netzwerk-Aufruf ist blockiert." });
  checks.push({ name:"secret_boundary", passed:envelope?.noSecretsIncluded === true && request.promptIncluded === false && request.secretValuesIncluded === false && !containsSecretValue(envelope), reason:"Keine Prompt- oder Secret-Werte dürfen in Gate-Daten enthalten sein." });
  checks.push({ name:"real_llm_blocked_without_approval", passed:envelope?.realLlmCallAllowed === false && envelope?.llmCallPerformed === false, reason:"Real LLM Call bleibt ohne Approval blockiert." });
  checks.push({ name:"execution_blocked", passed:envelope?.executionAllowed === false && envelope?.toolExecutionAllowed === false && envelope?.agentExecutionAllowed === false, reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert." });
  checks.push({ name:"dry_run_only", passed:envelope?.dryRunOnly === true, reason:envelope?.dryRunOnly === true ? "Dry-run-only ist aktiv." : "Dry-run-only fehlt." });
  checks.push({ name:"output_contract_locked", passed:output.outputType === "recommendation_explanation_only" && output.mayExecuteTools === false && output.mayExecuteAgents === false && output.mayRevealSecrets === false && output.mayChangeState === false, reason:"Output Contract muss nicht-ausführend bleiben." });
  checks.push({ name:"operational_controls_metadata_only", passed:defaults.timeoutMs === 30000 && defaults.maxRetries === 0 && defaults.rateLimitPolicy === "not_configured_metadata_only" && defaults.costLimitPolicy === "not_configured_metadata_only" && defaults.observabilityMode === "metadata_only_no_prompt_or_secret_values", reason:"Operational Controls bleiben Metadata-only." });
  let decision:ControlledRealProviderInvocationGateDecision="real_provider_invocation_gate_prepared_human_approval_required";
  let reason="Controlled Real Provider Invocation Gate vorbereitet. Echte Provider Invocation benötigt explizite Human Approval. Kein automatischer Provider-/Netzwerk-Aufruf.";
  if(!envelope){ decision="blocked_missing_simulation_envelope"; reason="Simulation Envelope nicht gefunden."; }
  else if(request.networkCallAllowed !== false || envelope.networkCallPerformed !== false || envelope.providerExecutionAllowed !== false || request.provider !== "none" || request.modelSelected !== "none"){ decision="blocked_auto_provider_call_attempt"; reason="Automatischer Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(envelope.noSecretsIncluded !== true || request.promptIncluded !== false || request.secretValuesIncluded !== false || containsSecretValue(envelope)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(envelope.realLlmCallAllowed !== false || envelope.llmCallPerformed !== false){ decision="blocked_real_llm_allowed_without_approval"; reason="Real LLM Call ist ohne explizite Approval nicht blockiert."; }
  else if(envelope.executionAllowed !== false || envelope.toolExecutionAllowed !== false || envelope.agentExecutionAllowed !== false || envelope.dryRunOnly !== true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  else if(checks.find((c)=>c.name==="output_contract_locked")?.passed !== true){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt nicht-ausführende Regeln."; }
  else if(checks.find((c)=>c.name==="operational_controls_metadata_only")?.passed !== true){ decision="blocked_operational_controls_violation"; reason="Operational Controls verletzen Metadata-only Vorgaben."; }
  const gate:ControlledRealProviderInvocationGate={
    id:makeId("real-provider-gate"),
    timestamp:new Date().toISOString(),
    simulationEnvelopeId:envelope?.id || input.simulationEnvelopeId,
    preflightId:envelope?.preflightId,
    boundaryCheckId:envelope?.boundaryCheckId,
    adapterStubId:envelope?.adapterStubId,
    invocationEnvelopeId:envelope?.invocationEnvelopeId,
    decision,
    gateMode:"controlled_real_provider_invocation_gate_human_approval_required",
    approvalState:{ humanApprovalRequired:true, humanApproved:false, approvalTokenIssued:false },
    gateChecks:checks,
    providerCallPlan:{ providerSelectionAllowed:false, provider:"none", modelSelected:"none", networkCallAllowed:false, automaticInvocationAllowed:false, manualApprovalRequiredBeforeAnyExternalCall:true },
    operationalControls:{ timeoutMs:30000, maxRetries:0, rateLimitPolicy:"not_configured_metadata_only", costLimitPolicy:"not_configured_metadata_only", observabilityMode:"metadata_only_no_prompt_or_secret_values" },
    outputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    realLlmCallAllowed:false,
    llmCallPerformed:false,
    networkCallPerformed:false,
    providerExecutionAllowed:false,
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    noSecretsIncluded:decision !== "blocked_secret_boundary_violation",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"26.0", humanApprovalRequired:true, noAutomaticProviderCall:true, noNetworkCall:true, noProviderCall:true, noRealLlmCall:true, gateOnly:true },
  };
  appendGate(gate);
  appendGovernanceAuditEvent({
    type:"agent_registry_status_changed",
    actor:"api",
    entityType:"agent-registry",
    entityId:gate.id,
    status:gate.decision,
    riskLevel:"critical",
    summary:"Controlled Real Provider Invocation Gate: "+gate.decision,
    metadata:{ source:"phase26.0-controlled-real-provider-invocation-gate", gateId:gate.id, simulationEnvelopeId:gate.simulationEnvelopeId, humanApprovalRequired:true, humanApproved:false, networkCallPerformed:false, providerExecutionAllowed:false, llmCallPerformed:false },
  });
  return gate;
}
export function summarizeControlledRealProviderInvocationGates(gates:ControlledRealProviderInvocationGate[]){ const byDecision:Record<string,number>={}; for(const gate of gates){ byDecision[gate.decision]=(byDecision[gate.decision]||0)+1; } return { total:gates.length, byDecision }; }

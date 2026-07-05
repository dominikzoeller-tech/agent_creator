import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { appendGovernanceAuditEvent } from "./governance-audit-store";

export type ApprovalTokenActivationGateDecision =
  | "approval_token_activation_gate_prepared_no_provider_call"
  | "blocked_missing_issuance_gate"
  | "blocked_issuance_not_prepared"
  | "blocked_issuance_intent_missing"
  | "blocked_token_not_issued"
  | "blocked_human_not_approved"
  | "blocked_auto_activation_attempt"
  | "blocked_secret_boundary_violation"
  | "blocked_provider_call_attempt"
  | "blocked_execution_not_safe";

export interface ApprovalTokenActivationGate {
  id: string;
  timestamp: string;
  issuanceGateId?: string;
  approvalTokenRequestId?: string;
  gateId?: string;
  simulationEnvelopeId?: string;
  preflightId?: string;
  boundaryCheckId?: string;
  adapterStubId?: string;
  invocationEnvelopeId?: string;
  decision: ApprovalTokenActivationGateDecision;
  activationGateMode: "explicit_human_approval_token_activation_gate_no_provider_call";
  activationChecks: Array<{ name: string; passed: boolean; reason: string }>;
  activationState: {
    approvalTokenRequested: true;
    approvalTokenIssuancePrepared: true;
    approvalTokenIssued: boolean;
    tokenActivationPrepared: true;
    tokenActive: false;
    humanApproved: boolean;
    humanApprovalRequired: true;
    issuanceIntentRecorded: boolean;
    activationIntentRecorded: boolean;
  };
  providerCallPlan: {
    providerSelectionAllowed: false;
    provider: "none";
    modelSelected: "none";
    networkCallAllowed: false;
    automaticInvocationAllowed: false;
  };
  operationalControls: {
    timeoutMs: 30000;
    maxRetries: 0;
    rateLimitPolicy: "not_configured_metadata_only";
    costLimitPolicy: "not_configured_metadata_only";
    observabilityMode: "metadata_only_no_prompt_or_secret_values";
  };
  approvalTokenRequested: true;
  approvalTokenIssuancePrepared: true;
  approvalTokenIssued: boolean;
  tokenActivationPrepared: true;
  tokenActive: false;
  humanApproved: boolean;
  humanApprovalRequired: true;
  activationIntentRecorded: boolean;
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
function issuanceGatePath(): string { return path.join(dataDir(), "approval-token-issuance-gates.jsonl"); }
function activationGatePath(): string { return path.join(dataDir(), "approval-token-activation-gates.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendGate(gate: ApprovalTokenActivationGate): void { ensureStore(); appendFileSync(activationGatePath(), JSON.stringify(gate)+"\n", "utf8"); }
function containsSecretValue(value: unknown): boolean { return /(sk-[a-z0-9_-]{10,}|api[_-]?key\s*[:=]\s*[^\s,;]+|token\s*[:=]\s*[^\s,;]+|secret\s*[:=]\s*[^\s,;]+|password\s*[:=]\s*[^\s,;]+)/i.test(JSON.stringify(value || {})); }
export function listApprovalTokenActivationGates(limit=100): ApprovalTokenActivationGate[] { ensureStore(); return readJsonl(activationGatePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createApprovalTokenActivationGate(input:{ issuanceGateId?: string; activationIntentRecorded?: boolean; metadata?: Record<string, unknown> }): ApprovalTokenActivationGate {
  ensureStore();
  const issuanceGates=readJsonl(issuanceGatePath());
  const issuance=input.issuanceGateId ? issuanceGates.find((entry:any)=>entry.id===input.issuanceGateId) : issuanceGates[0];
  const state=issuance?.issuanceState || {};
  const plan=issuance?.providerCallPlan || {};
  const activationIntentRecorded=input.activationIntentRecorded === true;
  const checks:Array<{name:string;passed:boolean;reason:string}>=[];
  checks.push({name:"issuance_gate_exists",passed:Boolean(issuance),reason:issuance?"Approval Token Issuance Gate gefunden.":"Approval Token Issuance Gate fehlt."});
  checks.push({name:"issuance_prepared",passed:state.approvalTokenIssuancePrepared===true,reason:"Issuance muss vorbereitet sein."});
  checks.push({name:"issuance_intent_recorded",passed:state.issuanceIntentRecorded===true,reason:"Issuance Intent muss vorhanden sein."});
  checks.push({name:"activation_intent_recorded",passed:activationIntentRecorded,reason:"Activation Intent muss explizit aufgezeichnet sein."});
  checks.push({name:"token_issuance_state_known",passed:typeof state.approvalTokenIssued === "boolean",reason:"Token-Issuance-State muss bekannt sein."});
  checks.push({name:"token_activation_prepared_only",passed:true,reason:"Activation Gate bereitet Aktivierung nur vor."});
  checks.push({name:"token_not_active",passed:true,reason:"Token bleibt in Phase 29.0 nicht aktiv."});
  checks.push({name:"provider_call_blocked",passed:plan.providerSelectionAllowed===false && plan.provider==="none" && plan.modelSelected==="none" && plan.networkCallAllowed===false && plan.automaticInvocationAllowed===false,reason:"Provider-/Netzwerk-Aufruf bleibt blockiert."});
  checks.push({name:"secret_boundary",passed:issuance?.noSecretsIncluded===true && !containsSecretValue(issuance),reason:"Activation Gate darf keine Secret-Werte enthalten."});
  checks.push({name:"real_llm_blocked",passed:issuance?.realLlmCallAllowed===false && issuance?.llmCallPerformed===false,reason:"Real LLM Call bleibt blockiert."});
  checks.push({name:"execution_blocked",passed:issuance?.executionAllowed===false && issuance?.toolExecutionAllowed===false && issuance?.agentExecutionAllowed===false && issuance?.dryRunOnly===true,reason:"Execution-, Tool- und Agent-Ausführung bleiben blockiert."});
  let decision:ApprovalTokenActivationGateDecision="approval_token_activation_gate_prepared_no_provider_call";
  let reason="Approval Token Activation Gate vorbereitet. Token bleibt nicht aktiv. Kein Provider-/Netzwerk-Aufruf.";
  if(!issuance){ decision="blocked_missing_issuance_gate"; reason="Approval Token Issuance Gate fehlt."; }
  else if(state.approvalTokenIssuancePrepared!==true){ decision="blocked_issuance_not_prepared"; reason="Token Issuance ist nicht vorbereitet."; }
  else if(state.issuanceIntentRecorded!==true){ decision="blocked_issuance_intent_missing"; reason="Issuance Intent fehlt."; }
  else if(state.approvalTokenIssued!==true){ decision="blocked_token_not_issued"; reason="Approval Token wurde noch nicht ausgestellt. Activation bleibt vorbereitet, aber blockiert."; }
  else if(state.humanApproved!==true){ decision="blocked_human_not_approved"; reason="Human Approval ist nicht true. Activation bleibt blockiert."; }
  else if(!activationIntentRecorded){ decision="blocked_auto_activation_attempt"; reason="Explizite Activation Intent fehlt."; }
  else if(issuance.noSecretsIncluded!==true || containsSecretValue(issuance)){ decision="blocked_secret_boundary_violation"; reason="Secret Boundary verletzt."; }
  else if(plan.providerSelectionAllowed!==false || plan.provider!=="none" || plan.modelSelected!=="none" || plan.networkCallAllowed!==false || plan.automaticInvocationAllowed!==false || issuance.networkCallPerformed!==false || issuance.providerExecutionAllowed!==false){ decision="blocked_provider_call_attempt"; reason="Provider-/Netzwerk-Aufruf oder Provider-Auswahl erkannt."; }
  else if(issuance.executionAllowed!==false || issuance.toolExecutionAllowed!==false || issuance.agentExecutionAllowed!==false || issuance.dryRunOnly!==true){ decision="blocked_execution_not_safe"; reason="Execution Safety Invariants verletzt."; }
  const gate:ApprovalTokenActivationGate={
    id:makeId("approval-token-activation-gate"),timestamp:new Date().toISOString(),issuanceGateId:issuance?.id||input.issuanceGateId,approvalTokenRequestId:issuance?.approvalTokenRequestId,gateId:issuance?.gateId,simulationEnvelopeId:issuance?.simulationEnvelopeId,preflightId:issuance?.preflightId,boundaryCheckId:issuance?.boundaryCheckId,adapterStubId:issuance?.adapterStubId,invocationEnvelopeId:issuance?.invocationEnvelopeId,decision,activationGateMode:"explicit_human_approval_token_activation_gate_no_provider_call",activationChecks:checks,
    activationState:{approvalTokenRequested:true,approvalTokenIssuancePrepared:true,approvalTokenIssued:state.approvalTokenIssued===true,tokenActivationPrepared:true,tokenActive:false,humanApproved:state.humanApproved===true,humanApprovalRequired:true,issuanceIntentRecorded:state.issuanceIntentRecorded===true,activationIntentRecorded},
    providerCallPlan:{providerSelectionAllowed:false,provider:"none",modelSelected:"none",networkCallAllowed:false,automaticInvocationAllowed:false},
    operationalControls:{timeoutMs:30000,maxRetries:0,rateLimitPolicy:"not_configured_metadata_only",costLimitPolicy:"not_configured_metadata_only",observabilityMode:"metadata_only_no_prompt_or_secret_values"},
    approvalTokenRequested:true,approvalTokenIssuancePrepared:true,approvalTokenIssued:state.approvalTokenIssued===true,tokenActivationPrepared:true,tokenActive:false,humanApproved:state.humanApproved===true,humanApprovalRequired:true,activationIntentRecorded,realLlmCallAllowed:false,llmCallPerformed:false,networkCallPerformed:false,providerExecutionAllowed:false,executionAllowed:false,toolExecutionAllowed:false,agentExecutionAllowed:false,dryRunOnly:true,noSecretsIncluded:decision!=="blocked_secret_boundary_violation",reason,metadata:{...(input.metadata||{}),phase:"29.0",approvalTokenActivationGateOnly:true,tokenActive:false,noNetworkCall:true,noProviderCall:true,noRealLlmCall:true}
  };
  appendGate(gate);
  appendGovernanceAuditEvent({type:"agent_registry_status_changed",actor:"api",entityType:"agent-registry",entityId:gate.id,status:gate.decision,riskLevel:"critical",summary:"Approval Token Activation Gate prepared: "+gate.decision,metadata:{source:"phase29.0-approval-token-activation-gate",activationGateId:gate.id,issuanceGateId:gate.issuanceGateId,tokenActive:false,networkCallPerformed:false,providerExecutionAllowed:false,llmCallPerformed:false}});
  return gate;
}
export function summarizeApprovalTokenActivationGates(gates:ApprovalTokenActivationGate[]){const byDecision:Record<string,number>={};for(const gate of gates){byDecision[gate.decision]=(byDecision[gate.decision]||0)+1;}return{total:gates.length,byDecision};}

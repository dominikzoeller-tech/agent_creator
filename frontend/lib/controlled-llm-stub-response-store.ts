import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type LlmStubDecision = "stub_response_created" | "blocked_missing_envelope" | "blocked_execution_not_safe" | "blocked_secret_risk" | "blocked_output_contract_violation";
export interface ControlledLlmStubResponse {
  id: string;
  timestamp: string;
  envelopeId?: string;
  recommendationId?: string;
  actionType?: string;
  decision: LlmStubDecision;
  responseText: string;
  responseSections: Array<{ title: string; body: string }>;
  sourceEnvelopeSummary: { recommendedNextAction?: string; missingSafetyGates: string[]; requiredConsentSteps: string[]; requiredPolicySteps: string[] };
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  llmCallPerformed: false;
  stubOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function responsePath(): string { return path.join(dataDir(), "controlled-llm-stub-responses.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendResponse(response: ControlledLlmStubResponse): void { ensureStore(); appendFileSync(responsePath(), JSON.stringify(response)+"\n", "utf8"); }
function hasSecretLikeText(value: unknown): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(JSON.stringify(value || {})); }
function safeText(value: unknown, fallback: string): string { return typeof value === "string" && value.trim() ? value.trim().slice(0, 1200) : fallback; }
function buildSections(envelope:any){
  const ctx=envelope?.sanitizedContext || {};
  const next=safeText(ctx.recommendedNextAction, "Zuerst sichere Vorbedingungen prüfen.");
  const missing=Array.isArray(ctx.missingSafetyGates)?ctx.missingSafetyGates:[];
  const consent=Array.isArray(ctx.requiredConsentSteps)?ctx.requiredConsentSteps:[];
  const policy=Array.isArray(ctx.requiredPolicySteps)?ctx.requiredPolicySteps:[];
  return [
    { title:"Empfohlener nächster Schritt", body: next },
    { title:"Fehlende Safety Gates", body: missing.length ? missing.join(", ") : "Keine fehlenden Safety Gates im Envelope erkannt." },
    { title:"Erforderliche Consent-Schritte", body: consent.length ? consent.join(", ") : "Keine zusätzlichen Consent-Schritte im Envelope erkannt." },
    { title:"Erforderliche Policy-/Audit-Schritte", body: policy.length ? policy.join(", ") : "Policy Simulation und Audit prüfen." },
    { title:"Sicherheitsgrenze", body:"Diese Antwort ist ein Stub. Es wurde kein LLM aufgerufen, kein Tool gestartet und kein Agent ausgeführt." },
  ];
}
export function listControlledLlmStubResponses(limit=100): ControlledLlmStubResponse[] { ensureStore(); return readJsonl(responsePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledLlmStubResponse(input:{ envelopeId?: string; metadata?: Record<string, unknown> }): ControlledLlmStubResponse {
  ensureStore();
  const envelopes=readJsonl(envelopePath());
  const envelope=input.envelopeId ? envelopes.find((entry:any)=>entry.id===input.envelopeId) : envelopes[0];
  let decision:LlmStubDecision="stub_response_created";
  let reason="Dry-run Explainer Response erstellt. Kein produktiver LLM-Aufruf, keine Ausführung.";
  if(!envelope){ decision="blocked_missing_envelope"; reason="Controlled LLM Routing Envelope nicht gefunden."; }
  else if(envelope.executionAllowed!==false || envelope.toolExecutionAllowed!==false || envelope.agentExecutionAllowed!==false || envelope.dryRunOnly!==true || envelope.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="Envelope verletzt Safety Invariants."; }
  else if(envelope.noSecretsIncluded!==true || hasSecretLikeText(envelope.sanitizedContext) || hasSecretLikeText(envelope.explainerPrompt)){ decision="blocked_secret_risk"; reason="Secret-Risiko im Envelope erkannt."; }
  else if(envelope.allowedOutputContract?.outputType!=="recommendation_explanation_only" || envelope.allowedOutputContract?.mayExecuteTools!==false || envelope.allowedOutputContract?.mayExecuteAgents!==false || envelope.allowedOutputContract?.mayRevealSecrets!==false || envelope.allowedOutputContract?.mayChangeState!==false){ decision="blocked_output_contract_violation"; reason="Output Contract verletzt Explanation-only-Regeln."; }
  const sections=envelope ? buildSections(envelope) : [{ title:"Blockiert", body:reason }];
  const ctx=envelope?.sanitizedContext || {};
  const responseText=sections.map((section)=>"### "+section.title+"\n"+section.body).join("\n\n");
  const response:ControlledLlmStubResponse={
    id:makeId("llm-stub-response"), timestamp:new Date().toISOString(), envelopeId:envelope?.id || input.envelopeId, recommendationId:envelope?.recommendationId, actionType:envelope?.actionType, decision, responseText, responseSections:sections,
    sourceEnvelopeSummary:{ recommendedNextAction: typeof ctx.recommendedNextAction === "string" ? ctx.recommendedNextAction : undefined, missingSafetyGates: Array.isArray(ctx.missingSafetyGates) ? ctx.missingSafetyGates : [], requiredConsentSteps: Array.isArray(ctx.requiredConsentSteps) ? ctx.requiredConsentSteps : [], requiredPolicySteps: Array.isArray(ctx.requiredPolicySteps) ? ctx.requiredPolicySteps : [] },
    executionAllowed:false, toolExecutionAllowed:false, agentExecutionAllowed:false, dryRunOnly:true, llmRoutingPrepOnly:true, llmCallPerformed:false, stubOnly:true, noSecretsIncluded: decision !== "blocked_secret_risk", reason,
    metadata:{ ...(input.metadata||{}), phase:"18.0", noExecution:true, noLlmCall:true, stubOnly:true },
  };
  appendResponse(response); return response;
}
export function summarizeControlledLlmStubResponses(responses:ControlledLlmStubResponse[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const response of responses){ byDecision[response.decision]=(byDecision[response.decision]||0)+1; if(response.actionType) byActionType[response.actionType]=(byActionType[response.actionType]||0)+1; } return { total:responses.length, byDecision, byActionType }; }

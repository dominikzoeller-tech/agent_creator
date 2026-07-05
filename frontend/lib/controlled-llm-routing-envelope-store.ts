import { mkdirSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";

export type LlmRoutingEnvelopeDecision = "envelope_created" | "blocked_missing_recommendation" | "blocked_execution_not_safe" | "blocked_context_not_sanitized";
export interface ControlledLlmRoutingEnvelope {
  id: string;
  timestamp: string;
  recommendationId?: string;
  orchestrationPlanId?: string;
  actionType?: string;
  decision: LlmRoutingEnvelopeDecision;
  sanitizedContext: {
    title?: string;
    recommendedNextAction?: string;
    missingSafetyGates: string[];
    requiredConsentSteps: string[];
    requiredPolicySteps: string[];
  };
  explainerPrompt: string;
  allowedOutputContract: {
    outputType: "recommendation_explanation_only";
    mayExecuteTools: false;
    mayExecuteAgents: false;
    mayRevealSecrets: false;
    mayChangeState: false;
  };
  executionAllowed: false;
  toolExecutionAllowed: false;
  agentExecutionAllowed: false;
  dryRunOnly: true;
  llmRoutingPrepOnly: true;
  noSecretsIncluded: boolean;
  reason: string;
  metadata?: Record<string, unknown>;
}
function dataDir(): string { return process.env.TOOL_CONSENT_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), "..", "data"); }
function recommendationsPath(): string { return path.join(dataDir(), "master-agent-planner-recommendations.jsonl"); }
function envelopePath(): string { return path.join(dataDir(), "controlled-llm-routing-envelopes.jsonl"); }
function ensureStore(): void { mkdirSync(dataDir(), { recursive: true }); }
function readJsonl(file:string): any[] { try { return readFileSync(file,"utf8").split(/\r?\n/).map((line)=>line.trim()).filter(Boolean).map((line)=>{ try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; } }
function makeId(prefix:string): string { const now=new Date().toISOString(); return prefix+"-"+now.replace(/[^0-9]/g,"").slice(0,14)+"-"+Math.random().toString(36).slice(2,8); }
function appendEnvelope(envelope: ControlledLlmRoutingEnvelope): void { ensureStore(); appendFileSync(envelopePath(), JSON.stringify(envelope)+"\n", "utf8"); }
function sanitizeText(value: unknown): string | undefined { if(typeof value !== "string") return undefined; return value.replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=REDACTED").slice(0, 1000); }
function hasSecretLikeText(value: string): boolean { return /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/i.test(value); }
function buildPrompt(ctx: ControlledLlmRoutingEnvelope["sanitizedContext"]): string { return [
  "Du bist ein Master-Agent-Routing-ErklÃ¤rer.",
  "ErklÃ¤re ausschlieÃŸlich den nÃ¤chsten sicheren Schritt.",
  "Starte keine Tools, keine Agenten und keine externen Aktionen.",
  "Gib keine Secrets aus und fordere keine Secrets an.",
  "Kontext:",
  JSON.stringify(ctx, null, 2)
].join("\n"); }
export function listControlledLlmRoutingEnvelopes(limit=100): ControlledLlmRoutingEnvelope[] { ensureStore(); return readJsonl(envelopePath()).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, Math.max(1, Math.min(limit,500))); }
export function createControlledLlmRoutingEnvelope(input:{ recommendationId?: string; metadata?: Record<string, unknown> }): ControlledLlmRoutingEnvelope {
  ensureStore();
  const recommendations=readJsonl(recommendationsPath());
  const recommendation=input.recommendationId ? recommendations.find((entry:any)=>entry.id===input.recommendationId) : recommendations[0];
  let decision: LlmRoutingEnvelopeDecision="envelope_created";
  let reason="Controlled LLM Routing Envelope erstellt. Phase 17.0 erzeugt nur erklÃ¤rbaren, sanitisierten Kontext; kein LLM-Aufruf und keine AusfÃ¼hrung.";
  if(!recommendation){ decision="blocked_missing_recommendation"; reason="Planner Recommendation nicht gefunden."; }
  else if(recommendation.executionAllowed!==false || recommendation.toolExecutionAllowed!==false || recommendation.agentExecutionAllowed!==false || recommendation.dryRunOnly!==true || recommendation.llmRoutingPrepOnly!==true){ decision="blocked_execution_not_safe"; reason="Planner Recommendation verletzt Safety Invariants."; }
  const sanitizedContext = {
    title: sanitizeText(recommendation?.title),
    recommendedNextAction: sanitizeText(recommendation?.recommendedNextAction),
    missingSafetyGates: Array.isArray(recommendation?.missingSafetyGates) ? recommendation.missingSafetyGates.map((v:any)=>String(v).slice(0,200)) : [],
    requiredConsentSteps: Array.isArray(recommendation?.requiredConsentSteps) ? recommendation.requiredConsentSteps.map((v:any)=>String(v).slice(0,200)) : [],
    requiredPolicySteps: Array.isArray(recommendation?.requiredPolicySteps) ? recommendation.requiredPolicySteps.map((v:any)=>String(v).slice(0,200)) : [],
  };
  const serialized=JSON.stringify(sanitizedContext);
  if(hasSecretLikeText(serialized)){ decision="blocked_context_not_sanitized"; reason="Sanitized Context enthÃ¤lt weiterhin secret-artige Muster."; }
  const envelope: ControlledLlmRoutingEnvelope = {
    id: makeId("llm-routing-envelope"),
    timestamp:new Date().toISOString(),
    recommendationId: recommendation?.id || input.recommendationId,
    orchestrationPlanId: recommendation?.orchestrationPlanId,
    actionType: recommendation?.actionType,
    decision,
    sanitizedContext,
    explainerPrompt: buildPrompt(sanitizedContext),
    allowedOutputContract:{ outputType:"recommendation_explanation_only", mayExecuteTools:false, mayExecuteAgents:false, mayRevealSecrets:false, mayChangeState:false },
    executionAllowed:false,
    toolExecutionAllowed:false,
    agentExecutionAllowed:false,
    dryRunOnly:true,
    llmRoutingPrepOnly:true,
    noSecretsIncluded: decision !== "blocked_context_not_sanitized",
    reason,
    metadata:{ ...(input.metadata||{}), phase:"17.0", noExecution:true, noLlmCall:true },
  };
  appendEnvelope(envelope);
  return envelope;
}
export function summarizeControlledLlmRoutingEnvelopes(envelopes: ControlledLlmRoutingEnvelope[]){ const byDecision:Record<string,number>={}; const byActionType:Record<string,number>={}; for(const envelope of envelopes){ byDecision[envelope.decision]=(byDecision[envelope.decision]||0)+1; if(envelope.actionType) byActionType[envelope.actionType]=(byActionType[envelope.actionType]||0)+1; } return { total:envelopes.length, byDecision, byActionType }; }


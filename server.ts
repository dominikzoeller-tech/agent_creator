import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse as parseUrl } from "node:url";
import { runMasterAgent } from "./master-agent";
import { appendDecisionLog } from "./decision-log";
import { buildKnowledgeRoutingContext, mergeKnowledgeContext } from "./knowledge-routing-context";
import { buildProjectMemoryContext, mergeProjectMemoryContext } from "./project-memory-context";
import { mergeWebResearchContext, runWebResearch, sanitizeWebResearchQuery, shouldUseWebResearch } from "./web-research";
import { summarizeWebResearchResults } from "./web-research-summary";
import { buildAgentDebugToolPreflight } from "./tool-preflight-debug";
import { buildToolEnforcementPrep } from "./tool-enforcement-prep";
import { createAgentFlowToolConsentRequest, getAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";
import { createAgentFlowCapabilityRequest, inferMissingCapabilityRequest } from "./tool-capability-request-agent-flow";
import {
  type DataSensitivity,
  type ProcessingMode,
  type ProcessingPath,
  classifyLocalRouteSuggestion,
  determineProcessingPath,
  redactContext,
  redactSensitiveText,
} from "./privacy-utils";

type OutputMode = "markdown" | "json";

interface AskRequestBody {
  userInput: string;
  context?: string[];
  outputMode?: OutputMode;
  includeCouncilResult?: boolean;
  sensitivity?: DataSensitivity;
  processingMode?: ProcessingMode;
  allowCloudForSensitive?: boolean;
  consentRequestId?: string;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

interface LocalPolicyResponse {
  ok: true;
  mode: "local_policy";
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  processingPath: ProcessingPath;
  routeSuggestion: "direct" | "council";
  answer: string;
  reason: string;
}

interface CloudResponse {
  ok: true;
  mode: "cloud";
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  processingPath: ProcessingPath;
  redacted: boolean;
  result: unknown;
}

function getPort(): number {
  const value = Number(process.env.PORT ?? 7071);
  return Number.isFinite(value) && value > 0 ? value : 7071;
}

function getBaseHeaders() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, getBaseHeaders());
  res.end(JSON.stringify(payload, null, 2));
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
  const payload: ErrorResponse = {
    ok: false,
    error: message,
  };
  sendJson(res, statusCode, payload);
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;

      if (raw.length > 1_000_000) {
        reject(new Error("Request Body ist zu groß."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request Body ist kein gültiges JSON."));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function normalizeRequestBody(input: unknown): AskRequestBody {
  const body = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;

  return {
    userInput: typeof body.userInput === "string" ? body.userInput : "",
    context: Array.isArray(body.context)
      ? body.context.filter((item): item is string => typeof item === "string")
      : [],
    outputMode: body.outputMode === "json" ? "json" : "markdown",
    includeCouncilResult: body.includeCouncilResult === true,
    sensitivity: isSensitivity(body.sensitivity) ? body.sensitivity : "internal",
    processingMode: isProcessingMode(body.processingMode) ? body.processingMode : "auto",
    allowCloudForSensitive: body.allowCloudForSensitive === true,
    consentRequestId: typeof body.consentRequestId === "string" ? body.consentRequestId : undefined,
  };
}

function isSensitivity(value: unknown): value is DataSensitivity {
  return value === "public" || value === "internal" || value === "confidential" || value === "restricted";
}

function isProcessingMode(value: unknown): value is ProcessingMode {
  return value === "auto" || value === "local_only" || value === "hybrid" || value === "cloud_allowed";
}

function buildLocalPolicyResponse(params: {
  userInput: string;
  context: string[];
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  processingPath: ProcessingPath;
}): LocalPolicyResponse {
  const routeSuggestion = classifyLocalRouteSuggestion(params.userInput, params.context);

  const reason =
    params.sensitivity === "restricted"
      ? "Für Sensitivität 'restricted' erlaubt diese privacy-first API standardmäßig keine Cloud-Verarbeitung."
      : "Der gewählte Modus erzwingt lokale Policy-Entscheidung ohne Cloud-LLM.";

  const answer =
    routeSuggestion === "council"
      ? "Diese Anfrage wirkt wie eine echte Entscheidungsfrage. Für sensible Daten wurde jedoch keine Cloud-LLM-Verarbeitung zugelassen. Nächster sinnvoller Schritt: lokalen / on-prem Modellpfad anbinden oder Inhalte vorab maskieren und erneut im Hybrid-Modus senden."
      : "Diese Anfrage kann lokal als nicht-kritische Direktfrage eingeordnet werden. Für sensible Daten wurde jedoch bewusst keine Cloud-LLM-Verarbeitung zugelassen. Nächster sinnvoller Schritt: lokalen / on-prem Modellpfad anbinden oder Inhalte vorab maskieren und erneut im Hybrid-Modus senden.";

  return {
    ok: true,
    mode: "local_policy",
    sensitivity: params.sensitivity,
    processingMode: params.processingMode,
    processingPath: params.processingPath,
    routeSuggestion,
    answer,
    reason,
  };
}


function isRecordForLogMetadata(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringArrayForLog(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;
}

function pickRoutingMetadataForLog(result: unknown): {
  suggestedAgents?: string[];
  routingDetails?: unknown;
  routingSummary?: string;
} {
  if (!isRecordForLogMetadata(result)) return {};

  const directSuggestedAgents = readStringArrayForLog(result.suggestedAgents);
  const directRoutingDetails = result.routingDetails;
  const directRoutingSummary = typeof result.routingSummary === "string" ? result.routingSummary : undefined;

  if (directSuggestedAgents || directRoutingDetails || directRoutingSummary) {
    return {
      suggestedAgents: directSuggestedAgents,
      routingDetails: directRoutingDetails,
      routingSummary: directRoutingSummary,
    };
  }

  const councilResult = result.councilResult;
  if (!isRecordForLogMetadata(councilResult)) return {};

  return {
    suggestedAgents: readStringArrayForLog(councilResult.suggestedAgents),
    routingDetails: councilResult.routingDetails,
    routingSummary: typeof councilResult.routingSummary === "string" ? councilResult.routingSummary : undefined,
  };
}

async function handleAsk(req: IncomingMessage, res: ServerResponse) {
  let rawBody: unknown;

  try {
    rawBody = await readJsonBody(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Request-Fehler";
    sendError(res, 400, message);
    return;
  }

  const body = normalizeRequestBody(rawBody);

  if (!body.userInput.trim()) {
    sendError(res, 400, "'userInput' ist erforderlich.");
    return;
  }

  const processingPath = determineProcessingPath({
    sensitivity: body.sensitivity ?? "internal",
    processingMode: body.processingMode ?? "auto",
    allowCloudForSensitive: body.allowCloudForSensitive ?? false,
  });

  if (processingPath === "local_policy") {
    const response = buildLocalPolicyResponse({
      userInput: body.userInput,
      context: body.context ?? [],
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
    });

    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: response.routeSuggestion,
      userInput: body.userInput,
      recommendation: null,
      firstStep: response.answer,
      confidence: null,
      context: body.context ?? [],
      extractedOptions: [],
      suggestedAgents: response.routeSuggestion === "council" ? ["privacy_agent", "risk_agent"] : ["privacy_agent"],
      routingSummary: "Route: " + response.routeSuggestion + " | Processing Path: " + processingPath,
      routingDetails: undefined,
    });

    sendJson(res, 200, response);
    return;
  }

  const effectiveUserInput =
    processingPath === "cloud_redacted" ? redactSensitiveText(body.userInput) : body.userInput;
  const baseEffectiveContext =
    processingPath === "cloud_redacted" ? redactContext(body.context ?? []) : (body.context ?? []);

  const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
  const knowledgeContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);
  const toolPreflight = buildAgentDebugToolPreflight({
    userInput: effectiveUserInput,
    sensitivity: body.sensitivity,
    processingMode: body.processingMode,
  });

  const toolEnforcement = buildToolEnforcementPrep(toolPreflight);

  if (toolEnforcement.hardBlocked) {
    const payload = {
      ok: true,
      mode: "cloud",
      result: {
        answer: "Diese Anfrage wurde durch Tool Permission Enforcement blockiert. Bitte Sensitivity, Processing Mode oder Tool-Anfrage prüfen.",
        toolPreflight,
        toolEnforcement,
      },
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
    return;
  }


  // PHASE 11.4: Missing Tool / Capability Request Flow
  const missingCapability = inferMissingCapabilityRequest(effectiveUserInput, toolPreflight.candidateToolIds ?? []);
  if (missingCapability.shouldCreate) {
    const capabilityRequest = createAgentFlowCapabilityRequest({
      requestedCapability: missingCapability.requestedCapability,
      reason: missingCapability.reason,
      userInputPreview: body.userInput,
      riskLevel: missingCapability.riskLevel,
      metadata: { source: "agent-flow", toolPreflight, toolEnforcement },
    });
    const capabilityUrl = "/capability-requests?requestId=" + encodeURIComponent(capabilityRequest.id);
    const payload = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: {
        answer: "Für diese Anfrage fehlt eine passende Tool- oder Agent-Fähigkeit. Es wurde ein kontrollierter Capability Request erstellt; es wird nichts automatisch gebaut oder ausgeführt.",
        capabilityRequestCreated: true,
        capabilityRequestId: capabilityRequest.id,
        capabilityUrl,
        requestedCapability: capabilityRequest.requestedCapability,
        status: capabilityRequest.status,
        riskLevel: capabilityRequest.riskLevel,
        toolPreflight,
        toolEnforcement,
        capabilityRequest: {
          id: capabilityRequest.id,
          url: capabilityUrl,
          requestedCapability: capabilityRequest.requestedCapability,
          status: capabilityRequest.status,
          riskLevel: capabilityRequest.riskLevel,
          source: "agent-flow",
        },
      },
    };
    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: "direct",
      userInput: body.userInput,
      recommendation: null,
      firstStep: "Capability Request erstellt: " + capabilityUrl,
      confidence: null,
      context: body.context ?? [],
      extractedOptions: [],
      suggestedAgents: ["privacy_agent"],
      routingSummary: "Missing Capability Request | Agent Flow | " + capabilityRequest.requestedCapability,
      routingDetails: undefined,
      toolPreflight,
      toolEnforcement,
      capabilityRequestCreated: true,
      capabilityRequestId: capabilityRequest.id,
      capabilityUrl,
    } as any);
    sendJson(res, 200, payload);
    return;
  }

  // PHASE 11.3: Approved Consent Resume Gate
  const phase113ConsentToolId =
    toolEnforcement.confirmationRequiredToolIds?.[0] ??
    toolPreflight.candidateToolIds?.[0] ??
    "unknown-tool";
  const phase113ConsentRequest = body.consentRequestId
    ? getAgentFlowToolConsentRequest(body.consentRequestId)
    : null;
  const approvedToolConsent =
    toolEnforcement.consentRequired === true &&
    Boolean(phase113ConsentRequest) &&
    phase113ConsentRequest?.status === "approved" &&
    phase113ConsentRequest?.toolId === phase113ConsentToolId;

  if (toolEnforcement.consentRequired && body.consentRequestId && !approvedToolConsent) {
    const consentUrl = "/tool-consent?requestId=" + encodeURIComponent(body.consentRequestId);
    const status = phase113ConsentRequest?.status ?? "missing";
    const payload = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: {
        answer: "Die Tool-Ausführung bleibt gesperrt, weil der Consent Request nicht approved ist.",
        consentRequired: true,
        consentRequestId: body.consentRequestId,
        consentUrl,
        toolId: phase113ConsentToolId,
        status,
        toolPreflight,
        toolEnforcement,
        toolConsent: {
          required: true,
          approved: false,
          source: "agent-flow-resume",
          requestId: body.consentRequestId,
          url: consentUrl,
          status,
          toolId: phase113ConsentToolId,
        },
      },
    };
    sendJson(res, 200, payload);
    return;
  }

  // PHASE 11.2: Agent Flow Consent Request Gate
  if (toolEnforcement.consentRequired && !approvedToolConsent) {
    const consentToolId = phase113ConsentToolId;
    const consentRequest = createAgentFlowToolConsentRequest({
      toolId: consentToolId,
      reason: "Agent Flow benötigt explizite Tool-Freigabe, bevor das Tool ausgeführt werden darf.",
      userInputPreview: body.userInput,
      sensitivity: body.sensitivity,
      processingMode: body.processingMode,
      metadata: {
        source: "agent-flow",
        toolEnforcement,
        candidateToolIds: toolPreflight.candidateToolIds,
      },
    });
    const consentUrl = "/tool-consent?requestId=" + encodeURIComponent(consentRequest.id);
    const payload = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: {
        answer: "Für diese Tool-Ausführung ist eine explizite Freigabe erforderlich. Die Ausführung wurde bis zur Entscheidung blockiert.",
        consentRequired: true,
        consentRequestCreated: true,
        consentRequestId: consentRequest.id,
        consentUrl,
        toolId: consentRequest.toolId,
        status: consentRequest.status,
        toolPreflight,
        toolEnforcement,
        toolConsent: {
          required: true,
          source: "agent-flow",
          requestId: consentRequest.id,
          url: consentUrl,
          status: consentRequest.status,
          toolId: consentRequest.toolId,
        },
      },
    };
    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: "direct",
      userInput: body.userInput,
      recommendation: null,
      firstStep: "Consent Request erstellt: " + consentUrl,
      confidence: null,
      context: body.context ?? [],
      extractedOptions: [],
      suggestedAgents: ["privacy_agent"],
      routingSummary: "Tool Consent Required | Agent Flow | " + consentRequest.toolId,
      routingDetails: undefined,
      toolPreflight,
      toolEnforcement,
      consentRequestCreated: true,
      consentRequestId: consentRequest.id,
      consentUrl,
      toolConsent: payload.result.toolConsent,
    } as any);
    sendJson(res, 200, payload);
    return;
  }

  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
  const memoryContext = mergeProjectMemoryContext(knowledgeContext, memory);

  const webResearchIntent = shouldUseWebResearch(effectiveUserInput);
  const webResearchQuery = sanitizeWebResearchQuery(effectiveUserInput);
  const webResearch = webResearchIntent && webResearchQuery.allowed
    ? await runWebResearch({ query: webResearchQuery.query, count: 5 })
    : {
        ok: true as const,
        enabled: process.env.WEB_RESEARCH_ENABLED === "true",
        provider: "disabled" as const,
        query: webResearchQuery.query,
        results: [],
        message: webResearchIntent ? webResearchQuery.reason : "Web Research für diese Anfrage nicht angefordert.",
      };
  const webResearchSummary = await summarizeWebResearchResults({
    query: webResearch.query,
    results: webResearch.results,
  });
  const effectiveContext = mergeWebResearchContext(memoryContext, webResearch);

  try {
    const result = await runMasterAgent({
      userInput: effectiveUserInput,
      context: effectiveContext,
      outputMode: body.outputMode ?? "markdown",
      includeCouncilResult: body.includeCouncilResult ?? false,
    });

    const resultWithKnowledge = {
      ...result,
      usedKnowledge: knowledge.hasHits,
      knowledgeSummary: knowledge.summary,
      knowledgeHits: knowledge.hits,
      usedMemory: memory.hasHits,
      memorySummary: memory.summary,
      memoryHits: memory.hits,
      usedWebResearch: webResearch.results.length > 0,
      webResearchEnabled: webResearch.enabled,
      webResearchQuery: webResearch.query,
      webResearchMessage: webResearch.message,
      webResearchResults: webResearch.results,
      usedWebResearchSummary: webResearchSummary.used,
      webResearchSummary: webResearchSummary.summary,
      webResearchSummaryMessage: webResearchSummary.message,
      webResearchSources: webResearchSummary.sources,
      toolPreflight,
      toolEnforcement,
      toolConsent: approvedToolConsent ? {
        required: true,
        approved: true,
        source: "agent-flow-resume",
        requestId: phase113ConsentRequest?.id,
        status: phase113ConsentRequest?.status,
        toolId: phase113ConsentRequest?.toolId,
      } : undefined,
    };

    const response: CloudResponse = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: resultWithKnowledge,
    };

    const resultForLog = result as {
      route?: "direct" | "council";
      recommendation?: string | null;
      firstStep?: string | null;
      confidence?: number | null;
      extractedOptions?: string[];
    };
    const routingMetadataForLog = pickRoutingMetadataForLog(resultWithKnowledge);

    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: resultForLog.route ?? "direct",
      userInput: body.userInput,
      recommendation: resultForLog.recommendation ?? null,
      firstStep: resultForLog.firstStep ?? null,
      confidence: typeof resultForLog.confidence === "number" ? resultForLog.confidence : null,
      context: body.context ?? [],
      extractedOptions: resultForLog.extractedOptions ?? [],
      suggestedAgents: routingMetadataForLog.suggestedAgents,
      routingDetails: routingMetadataForLog.routingDetails,
      routingSummary: routingMetadataForLog.routingSummary,
      usedKnowledge: resultWithKnowledge.usedKnowledge,
      knowledgeSummary: resultWithKnowledge.knowledgeSummary,
      knowledgeHits: resultWithKnowledge.knowledgeHits,
      usedMemory: resultWithKnowledge.usedMemory,
      memorySummary: resultWithKnowledge.memorySummary,
      memoryHits: resultWithKnowledge.memoryHits,
      usedWebResearch: resultWithKnowledge.usedWebResearch,
      webResearchEnabled: resultWithKnowledge.webResearchEnabled,
      webResearchQuery: resultWithKnowledge.webResearchQuery,
      webResearchMessage: resultWithKnowledge.webResearchMessage,
      webResearchResults: resultWithKnowledge.webResearchResults,
      usedWebResearchSummary: resultWithKnowledge.usedWebResearchSummary,
      webResearchSummary: resultWithKnowledge.webResearchSummary,
      webResearchSummaryMessage: resultWithKnowledge.webResearchSummaryMessage,
      webResearchSources: resultWithKnowledge.webResearchSources,
      toolPreflight: resultWithKnowledge.toolPreflight,
      toolEnforcement: resultWithKnowledge.toolEnforcement,
    });

    sendJson(res, 200, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler in /v1/ask";
    sendError(res, 500, message);
  }
}

async function handleRedact(req: IncomingMessage, res: ServerResponse) {
  let rawBody: unknown;

  try {
    rawBody = await readJsonBody(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Request-Fehler";
    sendError(res, 400, message);
    return;
  }

  const body = normalizeRequestBody(rawBody);

  if (!body.userInput.trim()) {
    sendError(res, 400, "'userInput' ist erforderlich.");
    return;
  }

  sendJson(res, 200, {
    ok: true,
    original: body.userInput,
    redacted: redactSensitiveText(body.userInput),
    redactedContext: redactContext(body.context ?? []),
  });
}

const server = createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url = parseUrl(req.url ?? "/", true);
  const pathname = url.pathname ?? "/";

  if (method === "OPTIONS") {
    res.writeHead(204, getBaseHeaders());
    res.end();
    return;
  }

  if (method === "GET" && pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "master-agent-api",
      status: "ok",
      port: getPort(),
      modes: {
        sensitivities: ["public", "internal", "confidential", "restricted"],
        processingModes: ["auto", "local_only", "hybrid", "cloud_allowed"],
        processingPaths: ["cloud_raw", "cloud_redacted", "local_policy"],
      },
    });
    return;
  }

  if (method === "POST" && pathname === "/v1/ask") {
    await handleAsk(req, res);
    return;
  }

  if (method === "POST" && pathname === "/v1/redact") {
    await handleRedact(req, res);
    return;
  }

  sendError(res, 404, `Keine Route gefunden für ${method} ${pathname}`);
});

server.listen(getPort(), () => {
  console.log("======================================");
  console.log(` Privacy-First API läuft auf http://localhost:${getPort()}`);
  console.log(" Endpunkte:");
  console.log(" - GET  /health");
  console.log(" - POST /v1/ask");
  console.log(" - POST /v1/redact");
  console.log("======================================");
});

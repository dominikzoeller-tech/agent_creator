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

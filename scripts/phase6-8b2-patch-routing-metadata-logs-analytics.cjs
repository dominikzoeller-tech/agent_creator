const fs = require("fs");
const path = require("path");

function fullPath(file) {
  return path.join(process.cwd(), file);
}

function exists(file) {
  return fs.existsSync(fullPath(file));
}

function read(file) {
  return fs.readFileSync(fullPath(file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(fullPath(file), content, "utf8");
}

function patchDecisionLog() {
  const file = "decision-log.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht gefunden.`);
    return;
  }

  let content = read(file);
  const original = content;

  if (!content.includes("suggestedAgents?: string[];")) {
    content = content.replace(
      "  extractedOptions?: string[];\n}",
      "  extractedOptions?: string[];\n  suggestedAgents?: string[];\n  routingDetails?: unknown;\n  routingSummary?: string;\n}"
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts erweitert.");
  } else {
    console.log("SKIP decision-log.ts war bereits erweitert oder Marker nicht gefunden.");
  }
}

function patchServer() {
  const file = "server.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht gefunden.`);
    return;
  }

  let content = read(file);
  const original = content;

  if (!content.includes('import { appendDecisionLog } from "./decision-log";')) {
    const importMarker = 'import { runMasterAgent } from "./master-agent";\n';
    if (!content.includes(importMarker)) {
      console.error("Konnte Import-Marker in server.ts nicht finden.");
      process.exit(1);
    }
    content = content.replace(
      importMarker,
      importMarker + 'import { appendDecisionLog } from "./decision-log";\n'
    );
  }

  if (!content.includes("function isRecordForLogMetadata")) {
    const helper = `
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

`;

    if (!content.includes("async function handleAsk")) {
      console.error("Konnte handleAsk Marker in server.ts nicht finden.");
      process.exit(1);
    }
    content = content.replace("async function handleAsk", helper + "async function handleAsk");
  }

  if (!content.includes("const routingMetadataForLog = pickRoutingMetadataForLog(result);")) {
    const oldBlock = `    const response: CloudResponse = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result,
    };

    sendJson(res, 200, response);`;

    const newBlock = `    const response: CloudResponse = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result,
    };

    const resultForLog = result as {
      route?: "direct" | "council";
      recommendation?: string | null;
      firstStep?: string | null;
      confidence?: number | null;
      extractedOptions?: string[];
    };
    const routingMetadataForLog = pickRoutingMetadataForLog(result);

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
    });

    sendJson(res, 200, response);`;

    if (!content.includes(oldBlock)) {
      console.error("Konnte CloudResponse/sendJson Block in server.ts nicht sicher finden.");
      process.exit(1);
    }
    content = content.replace(oldBlock, newBlock);
  }

  // Local-policy logging separat und sicher ohne Template-Literal-Falle patchen.
  if (!content.includes('route: response.routeSuggestion,')) {
    const oldLocal = `    const response = buildLocalPolicyResponse({
      userInput: body.userInput,
      context: body.context ?? [],
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
    });

    sendJson(res, 200, response);`;

    const newLocal = `    const response = buildLocalPolicyResponse({
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

    sendJson(res, 200, response);`;

    if (content.includes(oldLocal)) {
      content = content.replace(oldLocal, newLocal);
    } else {
      console.log("INFO Local policy block wurde nicht gepatcht. Cloud logging bleibt aktiv.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts erweitert.");
  } else {
    console.log("SKIP server.ts war bereits erweitert oder Marker nicht gefunden.");
  }
}

function patchLogsApi() {
  const file = "frontend/app/api/logs/route.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht vorhanden.`);
    return;
  }

  let content = read(file);
  const original = content;

  const oldHaystack = `[entry.userInput, entry.recommendation, entry.firstStep, ...(entry.extractedOptions ?? [])]`;
  const newHaystack = `[entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? [])]`;

  if (content.includes(oldHaystack)) {
    content = content.replace(oldHaystack, newHaystack);
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend logs API Suche erweitert.");
  } else {
    console.log("SKIP frontend logs API war bereits erweitert oder Marker nicht gefunden.");
  }
}

function patchAnalyticsApi() {
  const file = "frontend/app/api/analytics/route.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht vorhanden.`);
    return;
  }

  let content = read(file);
  const original = content;

  if (!content.includes("suggestedAgents?: string[];")) {
    content = content.replace(
      "  extractedOptions?: string[];\n}",
      "  extractedOptions?: string[];\n  suggestedAgents?: string[];\n  routingSummary?: string;\n  routingDetails?: {\n    complexity?: string;\n    privacyRisk?: string;\n    decisionNeed?: boolean;\n    implementationNeed?: boolean;\n    planningNeed?: boolean;\n    riskNeed?: boolean;\n  };\n}"
    );
  }

  const oldHaystack = `[entry.userInput, entry.recommendation, entry.firstStep, ...(entry.extractedOptions ?? [])]`;
  const newHaystack = `[entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? [])]`;

  if (content.includes(oldHaystack)) {
    content = content.replace(oldHaystack, newHaystack);
  }

  if (!content.includes("const topSuggestedAgents =")) {
    const marker = `    const topRecommendations = toTopItems(councilEntries.map((entry) => entry.recommendation ?? ""), 5);
    const topFirstSteps = toTopItems(councilEntries.map((entry) => entry.firstStep ?? ""), 5);
`;
    const replacement = marker + `    const topSuggestedAgents = toTopItems(councilEntries.flatMap((entry) => entry.suggestedAgents ?? []), 10);
    const topRoutingComplexities = toTopItems(councilEntries.map((entry) => entry.routingDetails?.complexity ?? ""), 5);
    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? ""), 5);
`;

    if (!content.includes(marker)) {
      console.error("Konnte TopItems Marker in Analytics API nicht finden.");
      process.exit(1);
    }
    content = content.replace(marker, replacement);
  }

  if (!content.includes("topSuggestedAgents,")) {
    content = content.replace(
      `      topRecommendations,
      topFirstSteps,
      topPatterns,
`,
      `      topRecommendations,
      topFirstSteps,
      topSuggestedAgents,
      topRoutingComplexities,
      topPrivacyRisks,
      topPatterns,
`
    );
  }

  if (!content.includes("topSuggestedAgents: []")) {
    content = content.replace(
      `      topRecommendations: [],
      topFirstSteps: [],
      topPatterns: [],
`,
      `      topRecommendations: [],
      topFirstSteps: [],
      topSuggestedAgents: [],
      topRoutingComplexities: [],
      topPrivacyRisks: [],
      topPatterns: [],
`
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK analytics API erweitert.");
  } else {
    console.log("SKIP analytics API war bereits erweitert oder Marker nicht gefunden.");
  }
}

function patchFrontendTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht vorhanden.`);
    return;
  }

  let content = read(file);
  const original = content;

  if (!content.includes("topSuggestedAgents?: TopItem[];")) {
    content = content.replace(
      "  topFirstSteps: TopItem[];\n  topPatterns: PatternItem[];",
      "  topFirstSteps: TopItem[];\n  topSuggestedAgents?: TopItem[];\n  topRoutingComplexities?: TopItem[];\n  topPrivacyRisks?: TopItem[];\n  topPatterns: PatternItem[];"
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts AnalyticsResponse erweitert.");
  } else {
    console.log("SKIP frontend/lib/types.ts war bereits erweitert oder Marker nicht gefunden.");
  }
}

patchDecisionLog();
patchServer();
patchLogsApi();
patchAnalyticsApi();
patchFrontendTypes();
console.log("Phase 6.8b2 Patch abgeschlossen.");

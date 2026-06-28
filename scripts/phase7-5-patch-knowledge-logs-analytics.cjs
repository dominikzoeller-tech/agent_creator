const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchDecisionLog() {
  const file = "decision-log.ts";
  let content = read(file);
  const original = content;
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes("export interface DecisionLogEntry"));
  if (start === -1) throw new Error("DecisionLogEntry nicht gefunden.");
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === "}") { end = i; break; }
  }
  if (end === -1) throw new Error("Ende von DecisionLogEntry nicht gefunden.");
  const interfaceText = lines.slice(start, end + 1).join("\n");
  const insertions = [];
  if (!interfaceText.includes("usedKnowledge?: boolean;")) insertions.push("  usedKnowledge?: boolean;");
  if (!interfaceText.includes("knowledgeSummary?: string;")) insertions.push("  knowledgeSummary?: string;");
  if (!interfaceText.includes("knowledgeHits?: unknown[];")) insertions.push("  knowledgeHits?: unknown[];");
  if (insertions.length > 0) {
    lines.splice(end, 0, ...insertions);
    content = lines.join("\n");
  }
  if (content !== original) { write(file, content); console.log("OK decision-log.ts: Knowledge-Felder ergänzt."); }
  else console.log("SKIP decision-log.ts: Knowledge-Felder bereits vorhanden.");
}

function patchServerLog() {
  const file = "server.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("usedKnowledge: resultWithKnowledge.usedKnowledge,")) {
    const marker = "      routingSummary: routingMetadataForLog.routingSummary,\n";
    if (!content.includes(marker)) throw new Error("Log-Marker in server.ts nicht gefunden.");
    content = content.replace(marker, marker + "      usedKnowledge: resultWithKnowledge.usedKnowledge,\n      knowledgeSummary: resultWithKnowledge.knowledgeSummary,\n      knowledgeHits: resultWithKnowledge.knowledgeHits,\n");
  }

  if (content !== original) { write(file, content); console.log("OK server.ts: Knowledge-Felder werden in Decision Log geschrieben."); }
  else console.log("SKIP server.ts: Knowledge-Logging bereits vorhanden.");
}

function patchLogsApi() {
  const file = "frontend/app/api/logs/route.ts";
  if (!exists(file)) { console.log(`SKIP ${file} nicht vorhanden.`); return; }
  let content = read(file);
  const original = content;

  if (!content.includes("entry.knowledgeSummary")) {
    const oldHaystack = "[entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? [])]";
    const newHaystack = "[entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, entry.knowledgeSummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? []), ...((entry.knowledgeHits ?? []).map((hit: any) => [hit.title, hit.sourcePath, ...(hit.tags ?? [])].filter(Boolean).join(' ')))]";
    if (content.includes(oldHaystack)) content = content.replace(oldHaystack, newHaystack);
    else console.log("INFO Logs API Haystack-Marker nicht gefunden; Suche bleibt unverändert.");
  }

  if (content !== original) { write(file, content); console.log("OK frontend logs API: Knowledge-Suche erweitert."); }
  else console.log("SKIP frontend logs API: keine Änderung nötig.");
}

function patchAnalyticsApi() {
  const file = "frontend/app/api/analytics/route.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("usedKnowledge?: boolean;")) {
    content = content.replace(
      "  suggestedAgents?: string[];\n",
      "  suggestedAgents?: string[];\n  usedKnowledge?: boolean;\n  knowledgeSummary?: string;\n  knowledgeHits?: { id?: string; title?: string; sourcePath?: string; score?: number; snippet?: string; tags?: string[] }[];\n"
    );
  }

  if (!content.includes("const knowledgeUsedEntries =")) {
    const marker = "    const directEntries = entries.filter((entry) => entry.route === \"direct\");\n    const councilEntries = entries.filter((entry) => entry.route === \"council\");\n";
    const addition = marker + "    const knowledgeUsedEntries = entries.filter((entry) => entry.usedKnowledge === true || (entry.knowledgeHits?.length ?? 0) > 0);\n    const knowledgeUsedCount = knowledgeUsedEntries.length;\n    const knowledgeUsedSharePercent = totalEntries > 0 ? round((knowledgeUsedCount / totalEntries) * 100) : 0;\n";
    if (!content.includes(marker)) throw new Error("Analytics entries marker nicht gefunden.");
    content = content.replace(marker, addition);
  }

  if (!content.includes("const topKnowledgeFiles =")) {
    const marker = "    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? \"\"), 5);\n";
    const addition = marker + "    const topKnowledgeFiles = toTopItems(knowledgeUsedEntries.flatMap((entry) => (entry.knowledgeHits ?? []).map((hit) => hit.title ?? hit.sourcePath ?? hit.id ?? \"\")), 10);\n    const topKnowledgeTags = toTopItems(knowledgeUsedEntries.flatMap((entry) => (entry.knowledgeHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);\n";
    if (!content.includes(marker)) throw new Error("Analytics topPrivacyRisks marker nicht gefunden.");
    content = content.replace(marker, addition);
  }

  if (!content.includes("knowledgeUsedCount,")) {
    content = content.replace(
      "      avgCouncilConfidencePercent,\n",
      "      avgCouncilConfidencePercent,\n      knowledgeUsedCount,\n      knowledgeUsedSharePercent,\n"
    );
  }

  if (!content.includes("topKnowledgeFiles,")) {
    content = content.replace(
      "      topPrivacyRisks,\n      topPatterns,\n",
      "      topPrivacyRisks,\n      topKnowledgeFiles,\n      topKnowledgeTags,\n      topPatterns,\n"
    );
  }

  if (!content.includes("knowledgeUsedCount: 0")) {
    content = content.replace(
      "      avgCouncilConfidencePercent: null,\n",
      "      avgCouncilConfidencePercent: null,\n      knowledgeUsedCount: 0,\n      knowledgeUsedSharePercent: 0,\n"
    );
  }

  if (!content.includes("topKnowledgeFiles: []")) {
    content = content.replace(
      "      topPrivacyRisks: [],\n      topPatterns: [],\n",
      "      topPrivacyRisks: [],\n      topKnowledgeFiles: [],\n      topKnowledgeTags: [],\n      topPatterns: [],\n"
    );
  }

  if (content !== original) { write(file, content); console.log("OK analytics API: Knowledge-Analytics ergänzt."); }
  else console.log("SKIP analytics API: Knowledge-Analytics bereits vorhanden.");
}

function patchTypes() {
  const file = "frontend/lib/types.ts";
  let content = read(file);
  const original = content;
  if (!content.includes("knowledgeUsedCount?: number;")) {
    content = content.replace(
      "  avgCouncilConfidencePercent: number | null;\n",
      "  avgCouncilConfidencePercent: number | null;\n  knowledgeUsedCount?: number;\n  knowledgeUsedSharePercent?: number;\n"
    );
  }
  if (!content.includes("topKnowledgeFiles?: TopItem[];")) {
    content = content.replace(
      "  topPrivacyRisks?: TopItem[];\n",
      "  topPrivacyRisks?: TopItem[];\n  topKnowledgeFiles?: TopItem[];\n  topKnowledgeTags?: TopItem[];\n"
    );
  }
  if (content !== original) { write(file, content); console.log("OK frontend/lib/types.ts: Knowledge-Analytics-Typen ergänzt."); }
  else console.log("SKIP frontend/lib/types.ts: Knowledge-Analytics-Typen bereits vorhanden.");
}

function detectAnalyticsVariable(content) {
  const candidates = [];
  const patterns = [
    /\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.directCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.topRecommendations\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.topSuggestedAgents\b/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) if (!candidates.includes(match[1])) candidates.push(match[1]);
  }
  for (const preferred of ["analytics", "analyticsData", "summary", "stats", "data"]) {
    if (candidates.includes(preferred)) return preferred;
  }
  return candidates[0] ?? "analytics";
}

function patchAnalyticsPage() {
  const file = "frontend/app/analytics/page.tsx";
  if (!exists(file)) { console.log(`SKIP ${file} nicht vorhanden.`); return; }
  let content = read(file);
  const original = content;
  const importLine = 'import { KnowledgeAnalyticsPanel } from "../../components/KnowledgeAnalyticsPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in Analytics Page nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }
  if (!content.includes("<KnowledgeAnalyticsPanel")) {
    const analyticsVar = detectAnalyticsVariable(content);
    const insertion = `\n        <KnowledgeAnalyticsPanel analytics={${analyticsVar}} />\n`;
    const agentPanelRegex = /^(\s*<AgentRoutingAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    if (agentPanelRegex.test(content)) content = content.replace(agentPanelRegex, `$1${insertion}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in Analytics Page gefunden.");
      content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
    }
  }
  if (content !== original) { write(file, content); console.log("OK frontend analytics page: KnowledgeAnalyticsPanel eingebunden."); }
  else console.log("SKIP frontend analytics page: KnowledgeAnalyticsPanel bereits vorhanden.");
}

patchDecisionLog();
patchServerLog();
patchLogsApi();
patchAnalyticsApi();
patchTypes();
patchAnalyticsPage();
console.log("Phase 7.5 Patch abgeschlossen.");

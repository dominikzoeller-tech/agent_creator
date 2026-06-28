const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchAnalyticsApi() {
  const file = "frontend/app/api/analytics/route.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file}: nicht vorhanden.`);
    return;
  }
  let content = read(file);
  const original = content;

  if (!content.includes("toolPreflight?:")) {
    if (content.includes("  webResearchSources?:")) {
      content = content.replace(/(  webResearchSources\?:[^\n]+\n)/, `$1  toolPreflight?: {\n    candidateToolIds?: string[];\n    allowedToolIds?: string[];\n    blockedToolIds?: string[];\n    decisions?: Array<{ toolId?: string; label?: string; candidate?: boolean; allowed?: boolean; requiresConfirmation?: boolean; reasons?: string[]; warnings?: string[]; riskLevel?: string }>;\n  };\n`);
    } else if (content.includes("  usedWebResearch?: boolean;\n")) {
      content = content.replace("  usedWebResearch?: boolean;\n", "  usedWebResearch?: boolean;\n  toolPreflight?: { candidateToolIds?: string[]; allowedToolIds?: string[]; blockedToolIds?: string[]; decisions?: Array<{ toolId?: string; label?: string; candidate?: boolean; allowed?: boolean; requiresConfirmation?: boolean; reasons?: string[]; warnings?: string[]; riskLevel?: string }>; };\n");
    } else {
      console.log("INFO analytics API: Entry type marker nicht gefunden; Typ-Erweiterung übersprungen.");
    }
  }

  if (!content.includes("const toolPreflightEntries =")) {
    const marker = "    const webResearchSummarySuccessPercent = webResearchUsedCount > 0 ? round((webResearchSummaryUsedCount / webResearchUsedCount) * 100) : 0;\n";
    const block = "    const toolPreflightEntries = entries.filter((entry) => Boolean(entry.toolPreflight));\n    const toolPreflightEntriesCount = toolPreflightEntries.length;\n    const toolPreflightCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.candidateToolIds?.length ?? 0), 0);\n    const toolPreflightAllowedCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.allowedToolIds?.length ?? 0), 0);\n    const toolPreflightBlockedCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.blockedToolIds?.length ?? 0), 0);\n    const toolPreflightBlockedSharePercent = toolPreflightCandidateCount > 0 ? round((toolPreflightBlockedCandidateCount / toolPreflightCandidateCount) * 100) : 0;\n    const toolPreflightHighRiskCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.decisions ?? []).filter((decision) => decision.candidate === true && decision.requiresConfirmation === true).length, 0);\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + block);
    } else {
      const fallback = "    const directEntries = entries.filter((entry) => entry.route === \"direct\");\n";
      if (!content.includes(fallback)) throw new Error("Analytics insertion marker nicht gefunden.");
      content = content.replace(fallback, block + fallback);
    }
  }

  if (!content.includes("const topToolPreflightCandidates =")) {
    const marker = "    const topWebResearchTitles = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchResults ?? []).map((result) => result.title ?? result.url ?? \"\")), 10);\n";
    const block = "    const topToolPreflightCandidates = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.candidateToolIds ?? []), 10);\n    const topToolPreflightBlockedTools = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.blockedToolIds ?? []), 10);\n    const topToolPreflightAllowedTools = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.allowedToolIds ?? []), 10);\n    const topToolPreflightBlockReasons = toTopItems(toolPreflightEntries.flatMap((entry) => (entry.toolPreflight?.decisions ?? []).flatMap((decision) => decision.candidate === true && decision.allowed === false ? (decision.reasons ?? []) : [])), 10);\n    const topToolPreflightWarnings = toTopItems(toolPreflightEntries.flatMap((entry) => (entry.toolPreflight?.decisions ?? []).flatMap((decision) => decision.candidate === true ? (decision.warnings ?? []) : [])), 10);\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + block);
    } else {
      const fallback = "    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? \"\"), 5);\n";
      if (!content.includes(fallback)) throw new Error("Top items insertion marker nicht gefunden.");
      content = content.replace(fallback, fallback + block);
    }
  }

  const scalarMarker = "      webResearchSummarySuccessPercent,\n";
  if (!content.includes("      toolPreflightEntriesCount,")) {
    if (content.includes(scalarMarker)) {
      content = content.replace(scalarMarker, scalarMarker + "      toolPreflightEntriesCount,\n      toolPreflightCandidateCount,\n      toolPreflightAllowedCandidateCount,\n      toolPreflightBlockedCandidateCount,\n      toolPreflightBlockedSharePercent,\n      toolPreflightHighRiskCandidateCount,\n");
    } else if (content.includes("      totalEntries,\n")) {
      content = content.replace("      totalEntries,\n", "      totalEntries,\n      toolPreflightEntriesCount,\n      toolPreflightCandidateCount,\n      toolPreflightAllowedCandidateCount,\n      toolPreflightBlockedCandidateCount,\n      toolPreflightBlockedSharePercent,\n      toolPreflightHighRiskCandidateCount,\n");
    }
  }

  const topMarker = "      topWebResearchTitles,\n";
  if (!content.includes("      topToolPreflightCandidates,")) {
    if (content.includes(topMarker)) {
      content = content.replace(topMarker, topMarker + "      topToolPreflightCandidates,\n      topToolPreflightBlockedTools,\n      topToolPreflightAllowedTools,\n      topToolPreflightBlockReasons,\n      topToolPreflightWarnings,\n");
    } else if (content.includes("      topRecommendations,\n")) {
      content = content.replace("      topRecommendations,\n", "      topRecommendations,\n      topToolPreflightCandidates,\n      topToolPreflightBlockedTools,\n      topToolPreflightAllowedTools,\n      topToolPreflightBlockReasons,\n      topToolPreflightWarnings,\n");
    }
  }

  if (!content.includes("toolPreflightEntriesCount: 0")) {
    if (content.includes("      webResearchSummarySuccessPercent: 0,\n")) {
      content = content.replace("      webResearchSummarySuccessPercent: 0,\n", "      webResearchSummarySuccessPercent: 0,\n      toolPreflightEntriesCount: 0,\n      toolPreflightCandidateCount: 0,\n      toolPreflightAllowedCandidateCount: 0,\n      toolPreflightBlockedCandidateCount: 0,\n      toolPreflightBlockedSharePercent: 0,\n      toolPreflightHighRiskCandidateCount: 0,\n");
    }
  }

  if (!content.includes("topToolPreflightCandidates: []")) {
    if (content.includes("      topWebResearchTitles: [],\n")) {
      content = content.replace("      topWebResearchTitles: [],\n", "      topWebResearchTitles: [],\n      topToolPreflightCandidates: [],\n      topToolPreflightBlockedTools: [],\n      topToolPreflightAllowedTools: [],\n      topToolPreflightBlockReasons: [],\n      topToolPreflightWarnings: [],\n");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK analytics API: Tool Preflight Analytics ergänzt.");
  } else console.log("SKIP analytics API: Tool Preflight Analytics bereits vorhanden.");
}

function patchTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes("toolPreflightEntriesCount?: number;")) {
    if (content.includes("  webResearchSummarySuccessPercent?: number;\n")) {
      content = content.replace("  webResearchSummarySuccessPercent?: number;\n", "  webResearchSummarySuccessPercent?: number;\n  toolPreflightEntriesCount?: number;\n  toolPreflightCandidateCount?: number;\n  toolPreflightAllowedCandidateCount?: number;\n  toolPreflightBlockedCandidateCount?: number;\n  toolPreflightBlockedSharePercent?: number;\n  toolPreflightHighRiskCandidateCount?: number;\n");
    } else if (content.includes("  totalEntries: number;\n")) {
      content = content.replace("  totalEntries: number;\n", "  totalEntries: number;\n  toolPreflightEntriesCount?: number;\n  toolPreflightCandidateCount?: number;\n  toolPreflightAllowedCandidateCount?: number;\n  toolPreflightBlockedCandidateCount?: number;\n  toolPreflightBlockedSharePercent?: number;\n  toolPreflightHighRiskCandidateCount?: number;\n");
    }
  }

  if (!content.includes("topToolPreflightCandidates?: TopItem[];")) {
    if (content.includes("  topWebResearchTitles?: TopItem[];\n")) {
      content = content.replace("  topWebResearchTitles?: TopItem[];\n", "  topWebResearchTitles?: TopItem[];\n  topToolPreflightCandidates?: TopItem[];\n  topToolPreflightBlockedTools?: TopItem[];\n  topToolPreflightAllowedTools?: TopItem[];\n  topToolPreflightBlockReasons?: TopItem[];\n  topToolPreflightWarnings?: TopItem[];\n");
    } else if (content.includes("  topRecommendations?: TopItem[];\n")) {
      content = content.replace("  topRecommendations?: TopItem[];\n", "  topRecommendations?: TopItem[];\n  topToolPreflightCandidates?: TopItem[];\n  topToolPreflightBlockedTools?: TopItem[];\n  topToolPreflightAllowedTools?: TopItem[];\n  topToolPreflightBlockReasons?: TopItem[];\n  topToolPreflightWarnings?: TopItem[];\n");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Tool Preflight Analytics Typen ergänzt.");
  } else console.log("SKIP frontend/lib/types.ts: Tool Preflight Analytics Typen bereits vorhanden.");
}

function patchAnalyticsPage() {
  const file = "frontend/app/analytics/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  const importLine = 'import { ToolPreflightAnalyticsPanel } from "../../components/ToolPreflightAnalyticsPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in Analytics Page nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<ToolPreflightAnalyticsPanel")) {
    const analyticsVar = detectAnalyticsVariable(content);
    const insertion = `\n        <ToolPreflightAnalyticsPanel analytics={${analyticsVar}} />\n`;
    const webResearchPanelRegex = /^(\s*<WebResearchAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    const memoryPanelRegex = /^(\s*<MemoryAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    if (webResearchPanelRegex.test(content)) content = content.replace(webResearchPanelRegex, `$1${insertion}`);
    else if (memoryPanelRegex.test(content)) content = content.replace(memoryPanelRegex, `$1${insertion}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in Analytics Page gefunden.");
      content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/analytics/page.tsx: ToolPreflightAnalyticsPanel eingebunden.");
  } else console.log("SKIP analytics page: ToolPreflightAnalyticsPanel bereits vorhanden.");
}

function detectAnalyticsVariable(content) {
  const candidates = [];
  const patterns = [/\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g, /\b([A-Za-z_$][\w$]*)\??\.toolPreflightEntriesCount\b/g, /\b([A-Za-z_$][\w$]*)\??\.webResearchUsedCount\b/g];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) if (!candidates.includes(match[1])) candidates.push(match[1]);
  }
  for (const preferred of ["data", "analytics", "analyticsData", "summary", "stats"]) if (candidates.includes(preferred)) return preferred;
  return candidates[0] ?? "data";
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:preflight:analytics:verify"] = "node scripts/phase10-5-verify-tool-preflight-analytics.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:preflight:analytics:verify eingetragen.");
}

patchAnalyticsApi();
patchTypes();
patchAnalyticsPage();
patchPackage();
console.log("Phase 10.5 Patch abgeschlossen.");

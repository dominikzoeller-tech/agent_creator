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

  if (!content.includes("usedWebResearch?: boolean;")) {
    if (content.includes("  webResearchResults?:")) {
      // Typen sind schon teilweise vorhanden.
    } else if (content.includes("  usedMemory?: boolean;\n")) {
      content = content.replace(
        "  usedMemory?: boolean;\n",
        "  usedMemory?: boolean;\n  usedWebResearch?: boolean;\n  webResearchEnabled?: boolean;\n  webResearchQuery?: string;\n  webResearchMessage?: string;\n  webResearchResults?: { title?: string; url?: string; snippet?: string; source?: string }[];\n  usedWebResearchSummary?: boolean;\n  webResearchSummary?: string;\n  webResearchSummaryMessage?: string;\n  webResearchSources?: { title?: string; url?: string; source?: string }[];\n"
      );
    } else if (content.includes("  knowledgeHits?:")) {
      content = content.replace(
        /(  knowledgeHits\?:[^\n]+\n)/,
        `$1  usedWebResearch?: boolean;\n  webResearchEnabled?: boolean;\n  webResearchQuery?: string;\n  webResearchMessage?: string;\n  webResearchResults?: { title?: string; url?: string; snippet?: string; source?: string }[];\n  usedWebResearchSummary?: boolean;\n  webResearchSummary?: string;\n  webResearchSummaryMessage?: string;\n  webResearchSources?: { title?: string; url?: string; source?: string }[];\n`
      );
    } else {
      console.log("INFO analytics API: Entry-Interface Marker nicht gefunden; Typ-Erweiterung übersprungen.");
    }
  }

  if (!content.includes("const webResearchUsedEntries =")) {
    const marker = "    const memoryUsedEntries = entries.filter((entry) => entry.usedMemory === true || (entry.memoryHits?.length ?? 0) > 0);\n    const memoryUsedCount = memoryUsedEntries.length;\n    const memoryUsedSharePercent = totalEntries > 0 ? round((memoryUsedCount / totalEntries) * 100) : 0;\n";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + "    const webResearchIntentEntries = entries.filter((entry) => Boolean(entry.webResearchQuery));\n    const webResearchUsedEntries = entries.filter((entry) => entry.usedWebResearch === true || (entry.webResearchResults?.length ?? 0) > 0);\n    const webResearchSummaryEntries = entries.filter((entry) => entry.usedWebResearchSummary === true || Boolean(entry.webResearchSummary));\n    const webResearchUsedCount = webResearchUsedEntries.length;\n    const webResearchUsedSharePercent = totalEntries > 0 ? round((webResearchUsedCount / totalEntries) * 100) : 0;\n    const webResearchSummaryUsedCount = webResearchSummaryEntries.length;\n    const webResearchSummarySuccessPercent = webResearchUsedCount > 0 ? round((webResearchSummaryUsedCount / webResearchUsedCount) * 100) : 0;\n"
      );
    } else {
      const fallback = "    const directEntries = entries.filter((entry) => entry.route === \"direct\");\n    const councilEntries = entries.filter((entry) => entry.route === \"council\");\n";
      if (!content.includes(fallback)) throw new Error("Analytics entries marker nicht gefunden.");
      content = content.replace(
        fallback,
        fallback + "    const webResearchIntentEntries = entries.filter((entry) => Boolean(entry.webResearchQuery));\n    const webResearchUsedEntries = entries.filter((entry) => entry.usedWebResearch === true || (entry.webResearchResults?.length ?? 0) > 0);\n    const webResearchSummaryEntries = entries.filter((entry) => entry.usedWebResearchSummary === true || Boolean(entry.webResearchSummary));\n    const webResearchUsedCount = webResearchUsedEntries.length;\n    const webResearchUsedSharePercent = totalEntries > 0 ? round((webResearchUsedCount / totalEntries) * 100) : 0;\n    const webResearchSummaryUsedCount = webResearchSummaryEntries.length;\n    const webResearchSummarySuccessPercent = webResearchUsedCount > 0 ? round((webResearchSummaryUsedCount / webResearchUsedCount) * 100) : 0;\n"
      );
    }
  }

  if (!content.includes("const topWebResearchQueries =")) {
    const marker = "    const topMemoryTitles = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.title ?? hit.id ?? \"\")), 10);\n";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + "    const topWebResearchQueries = toTopItems(webResearchIntentEntries.map((entry) => entry.webResearchQuery ?? \"\"), 10);\n    const topWebResearchSources = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchSources ?? []).map((source) => source.source ?? source.url ?? \"\")), 10);\n    const topWebResearchTitles = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchResults ?? []).map((result) => result.title ?? result.url ?? \"\")), 10);\n"
      );
    } else {
      const fallback = "    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? \"\"), 5);\n";
      if (!content.includes(fallback)) throw new Error("Analytics top-items marker nicht gefunden.");
      content = content.replace(
        fallback,
        fallback + "    const topWebResearchQueries = toTopItems(webResearchIntentEntries.map((entry) => entry.webResearchQuery ?? \"\"), 10);\n    const topWebResearchSources = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchSources ?? []).map((source) => source.source ?? source.url ?? \"\")), 10);\n    const topWebResearchTitles = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchResults ?? []).map((result) => result.title ?? result.url ?? \"\")), 10);\n"
      );
    }
  }

  if (!content.includes("webResearchUsedCount,")) {
    if (content.includes("      memoryUsedSharePercent,\n")) {
      content = content.replace(
        "      memoryUsedSharePercent,\n",
        "      memoryUsedSharePercent,\n      webResearchUsedCount,\n      webResearchUsedSharePercent,\n      webResearchSummaryUsedCount,\n      webResearchSummarySuccessPercent,\n"
      );
    } else if (content.includes("      avgCouncilConfidencePercent,\n")) {
      content = content.replace(
        "      avgCouncilConfidencePercent,\n",
        "      avgCouncilConfidencePercent,\n      webResearchUsedCount,\n      webResearchUsedSharePercent,\n      webResearchSummaryUsedCount,\n      webResearchSummarySuccessPercent,\n"
      );
    }
  }

  if (!content.includes("topWebResearchQueries,")) {
    if (content.includes("      topMemoryTitles,\n")) {
      content = content.replace(
        "      topMemoryTitles,\n",
        "      topMemoryTitles,\n      topWebResearchQueries,\n      topWebResearchSources,\n      topWebResearchTitles,\n"
      );
    } else if (content.includes("      topPrivacyRisks,\n")) {
      content = content.replace(
        "      topPrivacyRisks,\n",
        "      topPrivacyRisks,\n      topWebResearchQueries,\n      topWebResearchSources,\n      topWebResearchTitles,\n"
      );
    }
  }

  if (!content.includes("webResearchUsedCount: 0")) {
    if (content.includes("      memoryUsedSharePercent: 0,\n")) {
      content = content.replace(
        "      memoryUsedSharePercent: 0,\n",
        "      memoryUsedSharePercent: 0,\n      webResearchUsedCount: 0,\n      webResearchUsedSharePercent: 0,\n      webResearchSummaryUsedCount: 0,\n      webResearchSummarySuccessPercent: 0,\n"
      );
    } else if (content.includes("      avgCouncilConfidencePercent: null,\n")) {
      content = content.replace(
        "      avgCouncilConfidencePercent: null,\n",
        "      avgCouncilConfidencePercent: null,\n      webResearchUsedCount: 0,\n      webResearchUsedSharePercent: 0,\n      webResearchSummaryUsedCount: 0,\n      webResearchSummarySuccessPercent: 0,\n"
      );
    }
  }

  if (!content.includes("topWebResearchQueries: []")) {
    if (content.includes("      topMemoryTitles: [],\n")) {
      content = content.replace(
        "      topMemoryTitles: [],\n",
        "      topMemoryTitles: [],\n      topWebResearchQueries: [],\n      topWebResearchSources: [],\n      topWebResearchTitles: [],\n"
      );
    } else if (content.includes("      topPrivacyRisks: [],\n")) {
      content = content.replace(
        "      topPrivacyRisks: [],\n",
        "      topPrivacyRisks: [],\n      topWebResearchQueries: [],\n      topWebResearchSources: [],\n      topWebResearchTitles: [],\n"
      );
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK analytics API: Web Research Analytics ergänzt.");
  } else {
    console.log("SKIP analytics API: Web Research Analytics bereits vorhanden.");
  }
}

function patchTypes() {
  const file = "frontend/lib/types.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("webResearchUsedCount?: number;")) {
    if (content.includes("  memoryUsedSharePercent?: number;\n")) {
      content = content.replace(
        "  memoryUsedSharePercent?: number;\n",
        "  memoryUsedSharePercent?: number;\n  webResearchUsedCount?: number;\n  webResearchUsedSharePercent?: number;\n  webResearchSummaryUsedCount?: number;\n  webResearchSummarySuccessPercent?: number;\n"
      );
    } else if (content.includes("  totalEntries: number;\n")) {
      content = content.replace(
        "  totalEntries: number;\n",
        "  totalEntries: number;\n  webResearchUsedCount?: number;\n  webResearchUsedSharePercent?: number;\n  webResearchSummaryUsedCount?: number;\n  webResearchSummarySuccessPercent?: number;\n"
      );
    }
  }

  if (!content.includes("topWebResearchQueries?: TopItem[];")) {
    if (content.includes("  topMemoryTitles?: TopItem[];\n")) {
      content = content.replace(
        "  topMemoryTitles?: TopItem[];\n",
        "  topMemoryTitles?: TopItem[];\n  topWebResearchQueries?: TopItem[];\n  topWebResearchSources?: TopItem[];\n  topWebResearchTitles?: TopItem[];\n"
      );
    } else if (content.includes("  topRecommendations?: TopItem[];\n")) {
      content = content.replace(
        "  topRecommendations?: TopItem[];\n",
        "  topRecommendations?: TopItem[];\n  topWebResearchQueries?: TopItem[];\n  topWebResearchSources?: TopItem[];\n  topWebResearchTitles?: TopItem[];\n"
      );
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Web Research Analytics Typen ergänzt.");
  } else {
    console.log("SKIP frontend/lib/types.ts: Web Research Analytics Typen bereits vorhanden.");
  }
}

function patchAnalyticsPage() {
  const file = "frontend/app/analytics/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  const importLine = 'import { WebResearchAnalyticsPanel } from "../../components/WebResearchAnalyticsPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in Analytics Page nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<WebResearchAnalyticsPanel")) {
    const analyticsVar = detectAnalyticsVariable(content);
    const insertion = `\n        <WebResearchAnalyticsPanel analytics={${analyticsVar}} />\n`;
    const memoryPanelRegex = /^(\s*<MemoryAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    const knowledgePanelRegex = /^(\s*<KnowledgeAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    if (memoryPanelRegex.test(content)) content = content.replace(memoryPanelRegex, `$1${insertion}`);
    else if (knowledgePanelRegex.test(content)) content = content.replace(knowledgePanelRegex, `$1${insertion}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in Analytics Page gefunden.");
      content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/analytics/page.tsx: WebResearchAnalyticsPanel eingebunden.");
  } else {
    console.log("SKIP analytics page: WebResearchAnalyticsPanel bereits vorhanden.");
  }
}

function detectAnalyticsVariable(content) {
  const candidates = [];
  const patterns = [
    /\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.webResearchUsedCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.memoryUsedCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.knowledgeUsedCount\b/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) if (!candidates.includes(match[1])) candidates.push(match[1]);
  }
  for (const preferred of ["data", "analytics", "analyticsData", "summary", "stats"]) {
    if (candidates.includes(preferred)) return preferred;
  }
  return candidates[0] ?? "data";
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:analytics:patch"] = "node scripts/phase9-4-patch-web-research-analytics.cjs";
  pkg.scripts["web:research:analytics:verify"] = "node scripts/phase9-4-verify-web-research-analytics.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:analytics:* eingetragen.");
}

patchAnalyticsApi();
patchTypes();
patchAnalyticsPage();
patchPackage();
console.log("Phase 9.4 Patch abgeschlossen.");

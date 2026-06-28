const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchAnalyticsApi() {
  const file = "frontend/app/api/analytics/route.ts";
  if (!exists(file)) {
    console.log(`SKIP ${file} nicht vorhanden.`);
    return;
  }

  let content = read(file);
  const original = content;

  if (!content.includes("usedMemory?: boolean;")) {
    if (content.includes("  knowledgeHits?:")) {
      content = content.replace(
        /(  knowledgeHits\?:[^\n]+\n)/,
        `$1  usedMemory?: boolean;\n  memorySummary?: string;\n  memoryHits?: { id?: string; type?: string; title?: string; summary?: string; tags?: string[]; source?: string }[];\n`
      );
    } else if (content.includes("  suggestedAgents?: string[];\n")) {
      content = content.replace(
        "  suggestedAgents?: string[];\n",
        "  suggestedAgents?: string[];\n  usedMemory?: boolean;\n  memorySummary?: string;\n  memoryHits?: { id?: string; type?: string; title?: string; summary?: string; tags?: string[]; source?: string }[];\n"
      );
    } else {
      console.log("INFO analytics API: Entry-Interface Marker nicht gefunden; Typ-Ergänzung übersprungen.");
    }
  }

  if (!content.includes("const memoryUsedEntries =")) {
    const marker = "    const knowledgeUsedEntries = entries.filter((entry) => entry.usedKnowledge === true || (entry.knowledgeHits?.length ?? 0) > 0);\n    const knowledgeUsedCount = knowledgeUsedEntries.length;\n    const knowledgeUsedSharePercent = totalEntries > 0 ? round((knowledgeUsedCount / totalEntries) * 100) : 0;\n";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + "    const memoryUsedEntries = entries.filter((entry) => entry.usedMemory === true || (entry.memoryHits?.length ?? 0) > 0);\n    const memoryUsedCount = memoryUsedEntries.length;\n    const memoryUsedSharePercent = totalEntries > 0 ? round((memoryUsedCount / totalEntries) * 100) : 0;\n"
      );
    } else {
      const fallback = "    const directEntries = entries.filter((entry) => entry.route === \"direct\");\n    const councilEntries = entries.filter((entry) => entry.route === \"council\");\n";
      if (content.includes(fallback)) {
        content = content.replace(
          fallback,
          fallback + "    const memoryUsedEntries = entries.filter((entry) => entry.usedMemory === true || (entry.memoryHits?.length ?? 0) > 0);\n    const memoryUsedCount = memoryUsedEntries.length;\n    const memoryUsedSharePercent = totalEntries > 0 ? round((memoryUsedCount / totalEntries) * 100) : 0;\n"
        );
      } else {
        throw new Error("Analytics entries marker nicht gefunden.");
      }
    }
  }

  if (!content.includes("const topMemoryTypes =")) {
    const marker = "    const topKnowledgeTags = toTopItems(knowledgeUsedEntries.flatMap((entry) => (entry.knowledgeHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);\n";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + "    const topMemoryTypes = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.type ?? \"\")), 10);\n    const topMemoryTags = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);\n    const topMemoryTitles = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.title ?? hit.id ?? \"\")), 10);\n"
      );
    } else {
      const fallback = "    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? \"\"), 5);\n";
      if (content.includes(fallback)) {
        content = content.replace(
          fallback,
          fallback + "    const topMemoryTypes = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.type ?? \"\")), 10);\n    const topMemoryTags = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);\n    const topMemoryTitles = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.title ?? hit.id ?? \"\")), 10);\n"
        );
      } else {
        throw new Error("Analytics top-items marker nicht gefunden.");
      }
    }
  }

  if (!content.includes("memoryUsedCount,")) {
    if (content.includes("      knowledgeUsedSharePercent,\n")) {
      content = content.replace(
        "      knowledgeUsedSharePercent,\n",
        "      knowledgeUsedSharePercent,\n      memoryUsedCount,\n      memoryUsedSharePercent,\n"
      );
    } else if (content.includes("      avgCouncilConfidencePercent,\n")) {
      content = content.replace(
        "      avgCouncilConfidencePercent,\n",
        "      avgCouncilConfidencePercent,\n      memoryUsedCount,\n      memoryUsedSharePercent,\n"
      );
    }
  }

  if (!content.includes("topMemoryTypes,")) {
    if (content.includes("      topKnowledgeTags,\n")) {
      content = content.replace(
        "      topKnowledgeTags,\n",
        "      topKnowledgeTags,\n      topMemoryTypes,\n      topMemoryTags,\n      topMemoryTitles,\n"
      );
    } else if (content.includes("      topPrivacyRisks,\n")) {
      content = content.replace(
        "      topPrivacyRisks,\n",
        "      topPrivacyRisks,\n      topMemoryTypes,\n      topMemoryTags,\n      topMemoryTitles,\n"
      );
    }
  }

  if (!content.includes("memoryUsedCount: 0")) {
    if (content.includes("      knowledgeUsedSharePercent: 0,\n")) {
      content = content.replace(
        "      knowledgeUsedSharePercent: 0,\n",
        "      knowledgeUsedSharePercent: 0,\n      memoryUsedCount: 0,\n      memoryUsedSharePercent: 0,\n"
      );
    } else if (content.includes("      avgCouncilConfidencePercent: null,\n")) {
      content = content.replace(
        "      avgCouncilConfidencePercent: null,\n",
        "      avgCouncilConfidencePercent: null,\n      memoryUsedCount: 0,\n      memoryUsedSharePercent: 0,\n"
      );
    }
  }

  if (!content.includes("topMemoryTypes: []")) {
    if (content.includes("      topKnowledgeTags: [],\n")) {
      content = content.replace(
        "      topKnowledgeTags: [],\n",
        "      topKnowledgeTags: [],\n      topMemoryTypes: [],\n      topMemoryTags: [],\n      topMemoryTitles: [],\n"
      );
    } else if (content.includes("      topPrivacyRisks: [],\n")) {
      content = content.replace(
        "      topPrivacyRisks: [],\n",
        "      topPrivacyRisks: [],\n      topMemoryTypes: [],\n      topMemoryTags: [],\n      topMemoryTitles: [],\n"
      );
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK analytics API: Memory-Analytics ergänzt.");
  } else {
    console.log("SKIP analytics API: Memory-Analytics bereits vorhanden.");
  }
}

function patchLogsApi() {
  const file = "frontend/app/api/logs/route.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes("entry.memorySummary")) {
    const marker = "entry.knowledgeSummary";
    if (content.includes(marker)) {
      content = content.replace("entry.knowledgeSummary", "entry.knowledgeSummary, entry.memorySummary");
      if (content.includes("entry.knowledgeHits ?? []") && !content.includes("entry.memoryHits ?? []")) {
        content = content.replace(
          "...((entry.knowledgeHits ?? []).map((hit: any) => [hit.title, hit.sourcePath, ...(hit.tags ?? [])].filter(Boolean).join(' ')))]",
          "...((entry.knowledgeHits ?? []).map((hit: any) => [hit.title, hit.sourcePath, ...(hit.tags ?? [])].filter(Boolean).join(' '))), ...((entry.memoryHits ?? []).map((hit: any) => [hit.title, hit.type, hit.summary, ...(hit.tags ?? [])].filter(Boolean).join(' ')))]"
        );
      }
    } else {
      console.log("INFO logs API: Such-Haystack Marker nicht gefunden; Memory-Suche übersprungen.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK logs API: Memory-Felder in Suche ergänzt.");
  } else {
    console.log("SKIP logs API: keine Änderung nötig.");
  }
}

function patchTypes() {
  const file = "frontend/lib/types.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("memoryUsedCount?: number;")) {
    content = content.replace(
      "  knowledgeUsedSharePercent?: number;\n",
      "  knowledgeUsedSharePercent?: number;\n  memoryUsedCount?: number;\n  memoryUsedSharePercent?: number;\n"
    );
  }

  if (!content.includes("topMemoryTypes?: TopItem[];")) {
    content = content.replace(
      "  topKnowledgeTags?: TopItem[];\n",
      "  topKnowledgeTags?: TopItem[];\n  topMemoryTypes?: TopItem[];\n  topMemoryTags?: TopItem[];\n  topMemoryTitles?: TopItem[];\n"
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Memory-Analytics-Typen ergänzt.");
  } else {
    console.log("SKIP frontend/lib/types.ts: Memory-Analytics-Typen bereits vorhanden.");
  }
}

function detectAnalyticsVariable(content) {
  const candidates = [];
  const patterns = [
    /\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.memoryUsedCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.knowledgeUsedCount\b/g,
    /\b([A-Za-z_$][\w$]*)\??\.topRecommendations\b/g,
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

function patchAnalyticsPage() {
  const file = "frontend/app/analytics/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  const importLine = 'import { MemoryAnalyticsPanel } from "../../components/MemoryAnalyticsPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in Analytics Page nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<MemoryAnalyticsPanel")) {
    const analyticsVar = detectAnalyticsVariable(content);
    const insertion = `\n        <MemoryAnalyticsPanel analytics={${analyticsVar}} />\n`;
    const knowledgePanelRegex = /^(\s*<KnowledgeAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    const agentPanelRegex = /^(\s*<AgentRoutingAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    if (knowledgePanelRegex.test(content)) content = content.replace(knowledgePanelRegex, `$1${insertion}`);
    else if (agentPanelRegex.test(content)) content = content.replace(agentPanelRegex, `$1${insertion}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in Analytics Page gefunden.");
      content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend analytics page: MemoryAnalyticsPanel eingebunden.");
  } else {
    console.log("SKIP frontend analytics page: MemoryAnalyticsPanel bereits vorhanden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:analytics:patch"] = "node scripts/phase8-4-patch-memory-logs-analytics.cjs";
  pkg.scripts["memory:analytics:verify"] = "node scripts/phase8-4-verify-memory-logs-analytics.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:analytics:patch und memory:analytics:verify eingetragen.");
}

patchAnalyticsApi();
patchLogsApi();
patchTypes();
patchAnalyticsPage();
patchPackage();
console.log("Phase 8.4 Patch abgeschlossen.");

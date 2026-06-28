const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchAnalyticsApi() {
  const file = "frontend/app/api/analytics/route.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes("toolEnforcement?:")) {
    if (content.includes("  toolPreflight?:")) {
      content = content.replace(/(  toolPreflight\?:[^\n]+\n)/, `$1  toolEnforcement?: { enabled?: boolean; dryRun?: boolean; wouldBlock?: boolean; blockedToolIds?: string[]; allowedToolIds?: string[]; confirmationRequiredToolIds?: string[]; reasons?: string[]; warnings?: string[]; mode?: string };\n`);
    } else if (content.includes("  usedWebResearch?: boolean;\n")) {
      content = content.replace("  usedWebResearch?: boolean;\n", "  usedWebResearch?: boolean;\n  toolEnforcement?: { enabled?: boolean; dryRun?: boolean; wouldBlock?: boolean; blockedToolIds?: string[]; allowedToolIds?: string[]; confirmationRequiredToolIds?: string[]; reasons?: string[]; warnings?: string[]; mode?: string };\n");
    }
  }

  if (!content.includes("const toolEnforcementEntries =")) {
    const marker = "    const toolPreflightHighRiskCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.decisions ?? []).filter((decision) => decision.candidate === true && decision.requiresConfirmation === true).length, 0);\n";
    const block = "    const toolEnforcementEntries = entries.filter((entry) => Boolean(entry.toolEnforcement));\n    const toolEnforcementEntriesCount = toolEnforcementEntries.length;\n    const toolEnforcementWouldBlockCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.wouldBlock === true).length;\n    const toolEnforcementWouldBlockSharePercent = toolEnforcementEntriesCount > 0 ? round((toolEnforcementWouldBlockCount / toolEnforcementEntriesCount) * 100) : 0;\n    const toolEnforcementDryRunCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === \"dry-run\").length;\n    const toolEnforcementEnforceModeCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === \"enforce\").length;\n    const toolEnforcementOffModeCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === \"off\").length;\n    const toolEnforcementConfirmationRequiredCount = toolEnforcementEntries.reduce((sum, entry) => sum + (entry.toolEnforcement?.confirmationRequiredToolIds?.length ?? 0), 0);\n";
    if (content.includes(marker)) content = content.replace(marker, marker + block);
    else {
      const fallback = "    const directEntries = entries.filter((entry) => entry.route === \"direct\");\n";
      if (!content.includes(fallback)) throw new Error("Analytics insertion marker nicht gefunden.");
      content = content.replace(fallback, block + fallback);
    }
  }

  if (!content.includes("const topToolEnforcementBlockedTools =")) {
    const marker = "    const topToolPreflightWarnings = toTopItems(toolPreflightEntries.flatMap((entry) => (entry.toolPreflight?.decisions ?? []).flatMap((decision) => decision.candidate === true ? (decision.warnings ?? []) : [])), 10);\n";
    const block = "    const topToolEnforcementBlockedTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.blockedToolIds ?? []), 10);\n    const topToolEnforcementAllowedTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.allowedToolIds ?? []), 10);\n    const topToolEnforcementConfirmationTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.confirmationRequiredToolIds ?? []), 10);\n    const topToolEnforcementReasons = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.reasons ?? []), 10);\n    const topToolEnforcementWarnings = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.warnings ?? []), 10);\n    const topToolEnforcementModes = toTopItems(toolEnforcementEntries.map((entry) => entry.toolEnforcement?.mode ?? \"\"), 5);\n";
    if (content.includes(marker)) content = content.replace(marker, marker + block);
    else {
      const fallback = "    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? \"\"), 5);\n";
      if (!content.includes(fallback)) throw new Error("Top items insertion marker nicht gefunden.");
      content = content.replace(fallback, fallback + block);
    }
  }

  if (!content.includes("      toolEnforcementEntriesCount,")) {
    const marker = "      toolPreflightHighRiskCandidateCount,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      toolEnforcementEntriesCount,\n      toolEnforcementWouldBlockCount,\n      toolEnforcementWouldBlockSharePercent,\n      toolEnforcementDryRunCount,\n      toolEnforcementEnforceModeCount,\n      toolEnforcementOffModeCount,\n      toolEnforcementConfirmationRequiredCount,\n");
    } else if (content.includes("      totalEntries,\n")) {
      content = content.replace("      totalEntries,\n", "      totalEntries,\n      toolEnforcementEntriesCount,\n      toolEnforcementWouldBlockCount,\n      toolEnforcementWouldBlockSharePercent,\n      toolEnforcementDryRunCount,\n      toolEnforcementEnforceModeCount,\n      toolEnforcementOffModeCount,\n      toolEnforcementConfirmationRequiredCount,\n");
    }
  }

  if (!content.includes("      topToolEnforcementBlockedTools,")) {
    const marker = "      topToolPreflightWarnings,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      topToolEnforcementBlockedTools,\n      topToolEnforcementAllowedTools,\n      topToolEnforcementConfirmationTools,\n      topToolEnforcementReasons,\n      topToolEnforcementWarnings,\n      topToolEnforcementModes,\n");
    } else if (content.includes("      topRecommendations,\n")) {
      content = content.replace("      topRecommendations,\n", "      topRecommendations,\n      topToolEnforcementBlockedTools,\n      topToolEnforcementAllowedTools,\n      topToolEnforcementConfirmationTools,\n      topToolEnforcementReasons,\n      topToolEnforcementWarnings,\n      topToolEnforcementModes,\n");
    }
  }

  if (!content.includes("toolEnforcementEntriesCount: 0")) {
    const marker = "      toolPreflightHighRiskCandidateCount: 0,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      toolEnforcementEntriesCount: 0,\n      toolEnforcementWouldBlockCount: 0,\n      toolEnforcementWouldBlockSharePercent: 0,\n      toolEnforcementDryRunCount: 0,\n      toolEnforcementEnforceModeCount: 0,\n      toolEnforcementOffModeCount: 0,\n      toolEnforcementConfirmationRequiredCount: 0,\n");
    }
  }

  if (!content.includes("topToolEnforcementBlockedTools: []")) {
    const marker = "      topToolPreflightWarnings: [],\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      topToolEnforcementBlockedTools: [],\n      topToolEnforcementAllowedTools: [],\n      topToolEnforcementConfirmationTools: [],\n      topToolEnforcementReasons: [],\n      topToolEnforcementWarnings: [],\n      topToolEnforcementModes: [],\n");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK analytics API: Tool Enforcement Analytics ergänzt.");
  } else console.log("SKIP analytics API: Tool Enforcement Analytics bereits vorhanden.");
}

function patchTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes("toolEnforcementEntriesCount?: number;")) {
    if (content.includes("  toolPreflightHighRiskCandidateCount?: number;\n")) {
      content = content.replace("  toolPreflightHighRiskCandidateCount?: number;\n", "  toolPreflightHighRiskCandidateCount?: number;\n  toolEnforcementEntriesCount?: number;\n  toolEnforcementWouldBlockCount?: number;\n  toolEnforcementWouldBlockSharePercent?: number;\n  toolEnforcementDryRunCount?: number;\n  toolEnforcementEnforceModeCount?: number;\n  toolEnforcementOffModeCount?: number;\n  toolEnforcementConfirmationRequiredCount?: number;\n");
    } else if (content.includes("  totalEntries: number;\n")) {
      content = content.replace("  totalEntries: number;\n", "  totalEntries: number;\n  toolEnforcementEntriesCount?: number;\n  toolEnforcementWouldBlockCount?: number;\n  toolEnforcementWouldBlockSharePercent?: number;\n  toolEnforcementDryRunCount?: number;\n  toolEnforcementEnforceModeCount?: number;\n  toolEnforcementOffModeCount?: number;\n  toolEnforcementConfirmationRequiredCount?: number;\n");
    }
  }

  if (!content.includes("topToolEnforcementBlockedTools?: TopItem[];")) {
    if (content.includes("  topToolPreflightWarnings?: TopItem[];\n")) {
      content = content.replace("  topToolPreflightWarnings?: TopItem[];\n", "  topToolPreflightWarnings?: TopItem[];\n  topToolEnforcementBlockedTools?: TopItem[];\n  topToolEnforcementAllowedTools?: TopItem[];\n  topToolEnforcementConfirmationTools?: TopItem[];\n  topToolEnforcementReasons?: TopItem[];\n  topToolEnforcementWarnings?: TopItem[];\n  topToolEnforcementModes?: TopItem[];\n");
    } else if (content.includes("  topRecommendations?: TopItem[];\n")) {
      content = content.replace("  topRecommendations?: TopItem[];\n", "  topRecommendations?: TopItem[];\n  topToolEnforcementBlockedTools?: TopItem[];\n  topToolEnforcementAllowedTools?: TopItem[];\n  topToolEnforcementConfirmationTools?: TopItem[];\n  topToolEnforcementReasons?: TopItem[];\n  topToolEnforcementWarnings?: TopItem[];\n  topToolEnforcementModes?: TopItem[];\n");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Tool Enforcement Analytics Typen ergänzt.");
  } else console.log("SKIP frontend/lib/types.ts: Tool Enforcement Analytics Typen bereits vorhanden.");
}

function patchAnalyticsPage() {
  const file = "frontend/app/analytics/page.tsx";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  const importLine = 'import { ToolEnforcementAnalyticsPanel } from "../../components/ToolEnforcementAnalyticsPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in Analytics Page nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<ToolEnforcementAnalyticsPanel")) {
    const analyticsVar = detectAnalyticsVariable(content);
    const insertion = `\n        <ToolEnforcementAnalyticsPanel analytics={${analyticsVar}} />\n`;
    const toolPreflightPanelRegex = /^(\s*<ToolPreflightAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    const webResearchPanelRegex = /^(\s*<WebResearchAnalyticsPanel\s+analytics=\{[^}]+\}\s*\/>)\s*$/m;
    if (toolPreflightPanelRegex.test(content)) content = content.replace(toolPreflightPanelRegex, `$1${insertion}`);
    else if (webResearchPanelRegex.test(content)) content = content.replace(webResearchPanelRegex, `$1${insertion}`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in Analytics Page gefunden.");
      content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/analytics/page.tsx: ToolEnforcementAnalyticsPanel eingebunden.");
  } else console.log("SKIP analytics page: ToolEnforcementAnalyticsPanel bereits vorhanden.");
}

function detectAnalyticsVariable(content) {
  const candidates = [];
  const patterns = [/\b([A-Za-z_$][\w$]*)\??\.totalEntries\b/g, /\b([A-Za-z_$][\w$]*)\??\.toolEnforcementEntriesCount\b/g, /\b([A-Za-z_$][\w$]*)\??\.toolPreflightEntriesCount\b/g];
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
  pkg.scripts["tools:enforcement:analytics:verify"] = "node scripts/phase10-8-verify-tool-enforcement-analytics.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:enforcement:analytics:verify eingetragen.");
}

patchAnalyticsApi();
patchTypes();
patchAnalyticsPage();
patchPackage();
console.log("Phase 10.8 Patch abgeschlossen.");

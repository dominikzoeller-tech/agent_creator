const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchServer() {
  const file = "server.ts";
  let content = read(file);
  const original = content;

  const importLine = 'import { summarizeWebResearchResults } from "./web-research-summary";';
  if (!content.includes(importLine)) {
    const marker = 'import { mergeWebResearchContext, runWebResearch, sanitizeWebResearchQuery, shouldUseWebResearch } from "./web-research";\n';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + importLine + "\n");
    } else {
      const fallback = 'import { runMasterAgent } from "./master-agent";\n';
      if (!content.includes(fallback)) throw new Error("Importbereich in server.ts nicht sicher gefunden.");
      content = content.replace(fallback, fallback + importLine + "\n");
    }
  }

  if (!content.includes("const webResearchSummary = await summarizeWebResearchResults")) {
    const marker = `  const effectiveContext = mergeWebResearchContext(memoryContext, webResearch);

  try {`;
    if (!content.includes(marker)) {
      throw new Error("Web-Research-Kontext-Block in server.ts nicht gefunden. Bitte Phase 9.1 prüfen.");
    }
    content = content.replace(
      marker,
      `  const webResearchSummary = await summarizeWebResearchResults({
    query: webResearch.query,
    results: webResearch.results,
  });
  const effectiveContext = mergeWebResearchContext(memoryContext, webResearch);

  try {`
    );
  }

  if (!content.includes("webResearchSummary: webResearchSummary.summary")) {
    const marker = `      webResearchResults: webResearch.results,
    };`;
    if (!content.includes(marker)) throw new Error("webResearchResults Marker in server.ts nicht gefunden.");
    content = content.replace(
      marker,
      `      webResearchResults: webResearch.results,
      usedWebResearchSummary: webResearchSummary.used,
      webResearchSummary: webResearchSummary.summary,
      webResearchSummaryMessage: webResearchSummary.message,
      webResearchSources: webResearchSummary.sources,
    };`
    );
  }

  if (!content.includes("usedWebResearchSummary: resultWithKnowledge.usedWebResearchSummary,")) {
    const marker = "      webResearchResults: resultWithKnowledge.webResearchResults,\n";
    if (content.includes(marker)) {
      content = content.replace(
        marker,
        marker + "      usedWebResearchSummary: resultWithKnowledge.usedWebResearchSummary,\n      webResearchSummary: resultWithKnowledge.webResearchSummary,\n      webResearchSummaryMessage: resultWithKnowledge.webResearchSummaryMessage,\n      webResearchSources: resultWithKnowledge.webResearchSources,\n"
      );
    } else {
      console.log("INFO server.ts: Log-Marker für Web Research Felder nicht gefunden; Summary wird nur in API-Response sichtbar.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: AI Web Research Summary ergänzt.");
  } else {
    console.log("SKIP server.ts: AI Web Research Summary bereits integriert.");
  }
}

function patchDecisionLog() {
  const file = "decision-log.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes("export interface DecisionLogEntry"));
  if (start === -1) return;
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === "}") { end = i; break; }
  }
  if (end === -1) return;

  const block = lines.slice(start, end + 1).join("\n");
  const insertions = [];
  if (!block.includes("usedWebResearchSummary?: boolean;")) insertions.push("  usedWebResearchSummary?: boolean;");
  if (!block.includes("webResearchSummary?: string;")) insertions.push("  webResearchSummary?: string;");
  if (!block.includes("webResearchSummaryMessage?: string;")) insertions.push("  webResearchSummaryMessage?: string;");
  if (!block.includes("webResearchSources?: unknown[];")) insertions.push("  webResearchSources?: unknown[];");

  if (insertions.length > 0) {
    lines.splice(end, 0, ...insertions);
    content = lines.join("\n");
  }

  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts: Web Research Summary Felder ergänzt.");
  } else {
    console.log("SKIP decision-log.ts: Web Research Summary Felder bereits vorhanden.");
  }
}

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;

  if (!content.includes("COPY web-research-summary.ts ./")) {
    const marker = "COPY web-research.ts ./";
    if (content.includes(marker)) content = content.replace(marker, marker + "\nCOPY web-research-summary.ts ./");
    else content += "\nCOPY web-research-summary.ts ./\n";
  }

  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: web-research-summary.ts wird ins API-Image kopiert.");
  } else {
    console.log("SKIP Dockerfile: web-research-summary.ts bereits eingebunden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:summary:patch"] = "node scripts/phase9-2-patch-ai-web-research-summary.cjs";
  pkg.scripts["web:research:summary:verify"] = "node scripts/phase9-2-verify-ai-web-research-summary.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:summary:* eingetragen.");
}

patchServer();
patchDecisionLog();
patchDockerfile();
patchPackage();
console.log("Phase 9.2 Patch abgeschlossen.");

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

  const importLine = 'import { buildAgentDebugToolPreflight } from "./tool-preflight-debug";';
  if (!content.includes(importLine)) {
    const marker = 'import { summarizeWebResearchResults } from "./web-research-summary";\n';
    if (content.includes(marker)) content = content.replace(marker, marker + importLine + "\n");
    else {
      const fallback = 'import { runMasterAgent } from "./master-agent";\n';
      if (!content.includes(fallback)) throw new Error("Importbereich in server.ts nicht gefunden.");
      content = content.replace(fallback, fallback + importLine + "\n");
    }
  }

  if (!content.includes("const toolPreflight = buildAgentDebugToolPreflight")) {
    const marker = "  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });\n";
    if (!content.includes(marker)) throw new Error("Memory Marker in server.ts nicht gefunden.");
    content = content.replace(
      marker,
      `  const toolPreflight = buildAgentDebugToolPreflight({\n    userInput: effectiveUserInput,\n    sensitivity: body.sensitivity,\n    processingMode: body.processingMode,\n  });\n\n${marker}`
    );
  }

  if (!content.includes("toolPreflight,")) {
    const marker = "      webResearchSources: webResearchSummary.sources,\n    };";
    if (content.includes(marker)) {
      content = content.replace(marker, "      webResearchSources: webResearchSummary.sources,\n      toolPreflight,\n    };");
    } else {
      const fallback = "      memoryHits: memory.hits,\n";
      if (!content.includes(fallback)) throw new Error("Response Marker in server.ts nicht gefunden.");
      content = content.replace(fallback, fallback + "      toolPreflight,\n");
    }
  }

  if (!content.includes("toolPreflight: resultWithKnowledge.toolPreflight,")) {
    const marker = "      webResearchSources: resultWithKnowledge.webResearchSources,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      toolPreflight: resultWithKnowledge.toolPreflight,\n");
    } else {
      console.log("INFO server.ts: Log Marker für Web Research Sources nicht gefunden; toolPreflight bleibt API-Response-Feld.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Tool Preflight Debug ergänzt.");
  } else console.log("SKIP server.ts: Tool Preflight Debug bereits vorhanden.");
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
  if (!block.includes("toolPreflight?: unknown;")) {
    lines.splice(end, 0, "  toolPreflight?: unknown;");
    content = lines.join("\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts: toolPreflight Feld ergänzt.");
  } else console.log("SKIP decision-log.ts: toolPreflight Feld bereits vorhanden.");
}

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;
  if (!content.includes("COPY tool-preflight-debug.ts ./")) {
    if (content.includes("COPY web-research-summary.ts ./")) {
      content = content.replace("COPY web-research-summary.ts ./", "COPY web-research-summary.ts ./\nCOPY tool-preflight-debug.ts ./");
    } else {
      content += "\nCOPY tool-preflight-debug.ts ./\n";
    }
  }
  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: tool-preflight-debug.ts eingebunden.");
  } else console.log("SKIP Dockerfile: tool-preflight-debug.ts bereits eingebunden.");
}

function patchFrontendTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("toolPreflight?: unknown;")) {
    if (content.includes("  webResearchSources?: WebResearchSource[];\n")) {
      content = content.replace("  webResearchSources?: WebResearchSource[];\n", "  webResearchSources?: WebResearchSource[];\n  toolPreflight?: unknown;\n");
    } else if (content.includes("  councilResult?: unknown;\n")) {
      content = content.replace("  councilResult?: unknown;\n", "  councilResult?: unknown;\n  toolPreflight?: unknown;\n");
    }
  }
  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: toolPreflight ergänzt.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:preflight:debug:verify"] = "node scripts/phase10-3-verify-tool-preflight-debug.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:preflight:debug:verify eingetragen.");
}

patchServer();
patchDecisionLog();
patchDockerfile();
patchFrontendTypes();
patchPackage();
console.log("Phase 10.3 Patch abgeschlossen.");

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

  const importLine = 'import { buildToolEnforcementPrep } from "./tool-enforcement-prep";';
  if (!content.includes(importLine)) {
    const marker = 'import { buildAgentDebugToolPreflight } from "./tool-preflight-debug";\n';
    if (content.includes(marker)) content = content.replace(marker, marker + importLine + "\n");
    else throw new Error("Import Marker für tool-preflight-debug in server.ts nicht gefunden.");
  }

  if (!content.includes("const toolEnforcement = buildToolEnforcementPrep(toolPreflight);")) {
    const marker = "  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });\n";
    if (!content.includes(marker)) throw new Error("Memory Marker in server.ts nicht gefunden.");
    content = content.replace(marker, "  const toolEnforcement = buildToolEnforcementPrep(toolPreflight);\n\n" + marker);
  }

  if (!content.includes("toolEnforcement,")) {
    const marker = "      toolPreflight,\n    };";
    if (content.includes(marker)) {
      content = content.replace(marker, "      toolPreflight,\n      toolEnforcement,\n    };");
    } else {
      const fallback = "      toolPreflight,\n";
      if (!content.includes(fallback)) throw new Error("toolPreflight Response Marker in server.ts nicht gefunden.");
      content = content.replace(fallback, fallback + "      toolEnforcement,\n");
    }
  }

  if (!content.includes("toolEnforcement: resultWithKnowledge.toolEnforcement,")) {
    const marker = "      toolPreflight: resultWithKnowledge.toolPreflight,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      toolEnforcement: resultWithKnowledge.toolEnforcement,\n");
    } else {
      console.log("INFO server.ts: Log Marker für toolPreflight nicht gefunden; toolEnforcement bleibt API-Response-Feld.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Tool Enforcement Prep ergänzt.");
  } else console.log("SKIP server.ts: Tool Enforcement Prep bereits vorhanden.");
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
  if (!block.includes("toolEnforcement?: unknown;")) {
    lines.splice(end, 0, "  toolEnforcement?: unknown;");
    content = lines.join("\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts: toolEnforcement Feld ergänzt.");
  } else console.log("SKIP decision-log.ts: toolEnforcement Feld bereits vorhanden.");
}

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;
  if (!content.includes("COPY tool-enforcement-prep.ts ./")) {
    if (content.includes("COPY tool-preflight-debug.ts ./")) {
      content = content.replace("COPY tool-preflight-debug.ts ./", "COPY tool-preflight-debug.ts ./\nCOPY tool-enforcement-prep.ts ./");
    } else content += "\nCOPY tool-enforcement-prep.ts ./\n";
  }
  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: tool-enforcement-prep.ts eingebunden.");
  } else console.log("SKIP Dockerfile: tool-enforcement-prep.ts bereits eingebunden.");
}

function patchFrontendTypes() {
  const file = "frontend/lib/types.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("toolEnforcement?: unknown;")) {
    if (content.includes("  toolPreflight?: unknown;\n")) content = content.replace("  toolPreflight?: unknown;\n", "  toolPreflight?: unknown;\n  toolEnforcement?: unknown;\n");
    else if (content.includes("  councilResult?: unknown;\n")) content = content.replace("  councilResult?: unknown;\n", "  councilResult?: unknown;\n  toolEnforcement?: unknown;\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: toolEnforcement ergänzt.");
  }
}

function patchEnvExample() {
  const file = ".env.example";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("TOOL_PERMISSION_ENFORCEMENT_ENABLED")) {
    content += `
# Tool Permission Enforcement Prep
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
TOOL_PERMISSION_BLOCK_EXTERNAL_NETWORK=true
TOOL_PERMISSION_BLOCK_WRITES=false
TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK=true
`;
  }
  if (content !== original) {
    write(file, content);
    console.log("OK .env.example: Tool Enforcement Settings ergänzt.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:enforcement:prep:verify"] = "node scripts/phase10-6-verify-tool-enforcement-prep.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:enforcement:prep:verify eingetragen.");
}

patchServer();
patchDecisionLog();
patchDockerfile();
patchFrontendTypes();
patchEnvExample();
patchPackage();
console.log("Phase 10.6 Patch abgeschlossen.");

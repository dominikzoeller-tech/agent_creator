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

  const importLine = 'import { mergeWebResearchContext, runWebResearch, sanitizeWebResearchQuery, shouldUseWebResearch } from "./web-research";';
  if (!content.includes(importLine)) {
    const marker = 'import { buildProjectMemoryContext, mergeProjectMemoryContext } from "./project-memory-context";\n';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + importLine + "\n");
    } else {
      const fallback = 'import { runMasterAgent } from "./master-agent";\n';
      if (!content.includes(fallback)) throw new Error("Importbereich in server.ts nicht sicher gefunden.");
      content = content.replace(fallback, fallback + importLine + "\n");
    }
  }

  if (!content.includes("const webResearchIntent = shouldUseWebResearch")) {
    const marker = `  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
  const effectiveContext = mergeProjectMemoryContext(knowledgeContext, memory);

  try {`;
    const replacement = `  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
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
  const effectiveContext = mergeWebResearchContext(memoryContext, webResearch);

  try {`;

    if (content.includes(marker)) {
      content = content.replace(marker, replacement);
    } else {
      const fallback = `  const effectiveContext = mergeProjectMemoryContext(knowledgeContext, memory);

  try {`;
      if (!content.includes(fallback)) throw new Error("Memory-Kontext-Block in server.ts nicht sicher gefunden.");
      content = content.replace(fallback, replacement);
    }
  }

  if (!content.includes("usedWebResearch: webResearch.results.length > 0")) {
    const marker = `      memoryHits: memory.hits,
    };`;
    if (!content.includes(marker)) throw new Error("resultWithKnowledge/Memory Marker in server.ts nicht gefunden.");
    content = content.replace(
      marker,
      `      memoryHits: memory.hits,
      usedWebResearch: webResearch.results.length > 0,
      webResearchEnabled: webResearch.enabled,
      webResearchQuery: webResearch.query,
      webResearchMessage: webResearch.message,
      webResearchResults: webResearch.results,
    };`
    );
  }

  if (!content.includes("usedWebResearch: resultWithKnowledge.usedWebResearch,")) {
    const marker = "      memoryHits: resultWithKnowledge.memoryHits,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      usedWebResearch: resultWithKnowledge.usedWebResearch,\n      webResearchEnabled: resultWithKnowledge.webResearchEnabled,\n      webResearchQuery: resultWithKnowledge.webResearchQuery,\n      webResearchMessage: resultWithKnowledge.webResearchMessage,\n      webResearchResults: resultWithKnowledge.webResearchResults,\n");
    } else {
      console.log("INFO server.ts: Log-Marker für Memory-Felder nicht gefunden; Web Research wird nur in API-Response sichtbar.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Web Research in Agent Flow ergänzt.");
  } else console.log("SKIP server.ts: Web Research Flow bereits integriert.");
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
  if (!block.includes("usedWebResearch?: boolean;")) insertions.push("  usedWebResearch?: boolean;");
  if (!block.includes("webResearchEnabled?: boolean;")) insertions.push("  webResearchEnabled?: boolean;");
  if (!block.includes("webResearchQuery?: string;")) insertions.push("  webResearchQuery?: string;");
  if (!block.includes("webResearchMessage?: string;")) insertions.push("  webResearchMessage?: string;");
  if (!block.includes("webResearchResults?: unknown[];")) insertions.push("  webResearchResults?: unknown[];");
  if (insertions.length > 0) {
    lines.splice(end, 0, ...insertions);
    content = lines.join("\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts: Web Research Felder ergänzt.");
  } else console.log("SKIP decision-log.ts: Web Research Felder bereits vorhanden.");
}

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;
  if (!content.includes("COPY web-research.ts ./")) {
    const marker = "COPY project-memory-context.ts ./";
    if (content.includes(marker)) content = content.replace(marker, marker + "\nCOPY web-research.ts ./");
    else content += "\nCOPY web-research.ts ./\n";
  }
  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: web-research.ts wird ins API-Image kopiert.");
  } else console.log("SKIP Dockerfile: web-research.ts bereits eingebunden.");
}

function patchCompose() {
  const file = "docker-compose.internal.yml";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const marker = "      PORT: 7071\n";
  if (content.includes(marker) && !content.includes("      WEB_RESEARCH_ENABLED:")) {
    content = content.replace(marker, marker + "      WEB_RESEARCH_ENABLED: ${WEB_RESEARCH_ENABLED:-false}\n      BING_SEARCH_API_KEY: ${BING_SEARCH_API_KEY:-}\n      BING_SEARCH_ENDPOINT: ${BING_SEARCH_ENDPOINT:-https://api.bing.microsoft.com/v7.0/search}\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK docker-compose.internal.yml: Web Research env fürs API ergänzt.");
  } else console.log("SKIP docker-compose.internal.yml: Web Research env bereits vorhanden oder Marker fehlt.");
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:flow:patch"] = "node scripts/phase9-1-patch-web-research-agent-flow.cjs";
  pkg.scripts["web:research:flow:verify"] = "node scripts/phase9-1-verify-web-research-agent-flow.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:flow:* eingetragen.");
}

patchServer();
patchDecisionLog();
patchDockerfile();
patchCompose();
patchPackage();
console.log("Phase 9.1 Patch abgeschlossen.");

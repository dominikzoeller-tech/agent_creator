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

  const importLine = 'import { buildProjectMemoryContext, mergeProjectMemoryContext } from "./project-memory-context";';
  if (!content.includes(importLine)) {
    const marker = 'import { buildKnowledgeRoutingContext, mergeKnowledgeContext } from "./knowledge-routing-context";\n';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + importLine + "\n");
    } else {
      const fallback = 'import { runMasterAgent } from "./master-agent";\n';
      if (!content.includes(fallback)) {
        throw new Error("Importbereich in server.ts nicht sicher gefunden.");
      }
      content = content.replace(fallback, fallback + importLine + "\n");
    }
  }

  if (!content.includes("const memory = await buildProjectMemoryContext")) {
    const oldBlock = `  const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
  const effectiveContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);

  try {`;

    const newBlock = `  const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
  const knowledgeContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);
  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
  const effectiveContext = mergeProjectMemoryContext(knowledgeContext, memory);

  try {`;

    if (!content.includes(oldBlock)) {
      const olderBlock = `  const effectiveContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);

  try {`;
      if (!content.includes(olderBlock)) {
        throw new Error("Knowledge-Kontext-Block in server.ts nicht sicher gefunden.");
      }
      content = content.replace(
        olderBlock,
        `  const knowledgeContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);
  const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
  const effectiveContext = mergeProjectMemoryContext(knowledgeContext, memory);

  try {`
      );
    } else {
      content = content.replace(oldBlock, newBlock);
    }
  }

  if (!content.includes("usedMemory: memory.hasHits")) {
    const marker = `      knowledgeHits: knowledge.hits,
    };`;
    if (!content.includes(marker)) {
      throw new Error("resultWithKnowledge Marker in server.ts nicht gefunden.");
    }
    content = content.replace(
      marker,
      `      knowledgeHits: knowledge.hits,
      usedMemory: memory.hasHits,
      memorySummary: memory.summary,
      memoryHits: memory.hits,
    };`
    );
  }

  if (!content.includes("usedMemory: resultWithKnowledge.usedMemory,")) {
    const marker = "      knowledgeHits: resultWithKnowledge.knowledgeHits,\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "      usedMemory: resultWithKnowledge.usedMemory,\n      memorySummary: resultWithKnowledge.memorySummary,\n      memoryHits: resultWithKnowledge.memoryHits,\n");
    } else {
      console.log("INFO server.ts: Log-Marker für Knowledge-Felder nicht gefunden; Memory wird nur in API-Response sichtbar.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Project Memory wird in den Agent Flow gemerged und in der Response ergänzt.");
  } else {
    console.log("SKIP server.ts: Project Memory Flow scheint bereits integriert zu sein.");
  }
}

function patchDecisionLog() {
  const file = "decision-log.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes("export interface DecisionLogEntry"));
  if (start === -1) {
    console.log("SKIP decision-log.ts: DecisionLogEntry nicht gefunden.");
    return;
  }
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === "}") { end = i; break; }
  }
  if (end === -1) return;
  const block = lines.slice(start, end + 1).join("\n");
  const insertions = [];
  if (!block.includes("usedMemory?: boolean;")) insertions.push("  usedMemory?: boolean;");
  if (!block.includes("memorySummary?: string;")) insertions.push("  memorySummary?: string;");
  if (!block.includes("memoryHits?: unknown[];")) insertions.push("  memoryHits?: unknown[];");
  if (insertions.length > 0) {
    lines.splice(end, 0, ...insertions);
    content = lines.join("\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK decision-log.ts: Memory-Felder ergänzt.");
  } else {
    console.log("SKIP decision-log.ts: Memory-Felder bereits vorhanden.");
  }
}

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;

  function ensureCopy(line, afterMarker) {
    if (content.includes(line)) return;
    if (content.includes(afterMarker)) {
      content = content.replace(afterMarker, afterMarker + "\n" + line);
    } else {
      content += "\n" + line + "\n";
    }
  }

  ensureCopy("COPY project-memory.ts ./", "COPY knowledge-routing-context.ts ./");
  ensureCopy("COPY project-memory-context.ts ./", "COPY project-memory.ts ./");
  ensureCopy("COPY memory ./memory", "COPY project-memory-context.ts ./");

  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: Project-Memory-Dateien werden ins API-Image kopiert.");
  } else {
    console.log("SKIP Dockerfile: Project-Memory-Dateien bereits eingebunden.");
  }
}

function patchCompose() {
  const file = "docker-compose.internal.yml";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  if (!content.includes("./memory:/app/memory")) {
    const apiLogs = "      - ./logs:/app/logs\n";
    if (content.includes(apiLogs)) {
      content = content.replace(apiLogs, apiLogs + "      - ./memory:/app/memory\n");
    } else {
      console.log("INFO docker-compose.internal.yml: API volumes Marker nicht gefunden.");
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK docker-compose.internal.yml: API erhält ./memory:/app/memory Volume.");
  } else {
    console.log("SKIP docker-compose.internal.yml: Memory Volume bereits vorhanden oder nicht geändert.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:flow:patch"] = "node scripts/phase8-2-patch-memory-agent-flow.cjs";
  pkg.scripts["memory:flow:verify"] = "node scripts/phase8-2-verify-memory-agent-flow.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:flow:patch und memory:flow:verify eingetragen.");
}

patchServer();
patchDecisionLog();
patchDockerfile();
patchCompose();
patchPackage();
console.log("Phase 8.2 Patch abgeschlossen.");

const fs = require("fs");
const path = require("path");

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(process.cwd(), file), content, "utf8");
}

function patchServer() {
  const file = "server.ts";
  let content = read(file);
  const original = content;

  const importLine = 'import { buildKnowledgeRoutingContext, mergeKnowledgeContext } from "./knowledge-routing-context";';
  if (!content.includes(importLine)) {
    const marker = 'import { appendDecisionLog } from "./decision-log";\n';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + importLine + "\n");
    } else {
      const fallbackMarker = 'import { runMasterAgent } from "./master-agent";\n';
      if (!content.includes(fallbackMarker)) {
        console.error("Konnte Importbereich in server.ts nicht sicher finden.");
        process.exit(1);
      }
      content = content.replace(fallbackMarker, fallbackMarker + importLine + "\n");
    }
  }

  if (!content.includes("const knowledge = await buildKnowledgeRoutingContext")) {
    const oldBlock = `  const effectiveUserInput =
    processingPath === "cloud_redacted" ? redactSensitiveText(body.userInput) : body.userInput;
  const effectiveContext =
    processingPath === "cloud_redacted" ? redactContext(body.context ?? []) : (body.context ?? []);

  try {`;

    const newBlock = `  const effectiveUserInput =
    processingPath === "cloud_redacted" ? redactSensitiveText(body.userInput) : body.userInput;
  const baseEffectiveContext =
    processingPath === "cloud_redacted" ? redactContext(body.context ?? []) : (body.context ?? []);

  const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
  const effectiveContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);

  try {`;

    if (!content.includes(oldBlock)) {
      console.error("Konnte effectiveUserInput/effectiveContext Block in server.ts nicht sicher finden.");
      process.exit(1);
    }
    content = content.replace(oldBlock, newBlock);
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Knowledge-Kontext wird vor runMasterAgent gemerged.");
  } else {
    console.log("SKIP server.ts: Knowledge-Kontext scheint bereits integriert zu sein.");
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
      const envMarker = "# Optional documentation / example config inside image";
      if (content.includes(envMarker)) {
        content = content.replace(envMarker, line + "\n" + envMarker);
      } else {
        content += "\n" + line + "\n";
      }
    }
  }

  ensureCopy("COPY knowledge-base.ts ./", "COPY council-routing-response-types.ts ./");
  ensureCopy("COPY knowledge-routing-context.ts ./", "COPY knowledge-base.ts ./");
  ensureCopy("COPY knowledge ./knowledge", "COPY knowledge-routing-context.ts ./");

  if (content !== original) {
    write(file, content);
    console.log("OK Dockerfile: Knowledge-Dateien werden ins API-Image kopiert.");
  } else {
    console.log("SKIP Dockerfile: Knowledge-Dateien sind bereits eingebunden.");
  }
}

patchServer();
patchDockerfile();
console.log("Phase 7.3b Knowledge Flow Patch abgeschlossen.");

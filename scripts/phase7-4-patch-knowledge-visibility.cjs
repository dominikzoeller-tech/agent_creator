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

  if (!content.includes("const resultWithKnowledge =")) {
    const oldBlock = `    const response: CloudResponse = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result,
    };`;

    const newBlock = `    const resultWithKnowledge = {
      ...result,
      usedKnowledge: knowledge.hasHits,
      knowledgeSummary: knowledge.summary,
      knowledgeHits: knowledge.hits,
    };

    const response: CloudResponse = {
      ok: true,
      mode: "cloud",
      sensitivity: body.sensitivity ?? "internal",
      processingMode: body.processingMode ?? "auto",
      processingPath,
      redacted: processingPath === "cloud_redacted",
      result: resultWithKnowledge,
    };`;

    if (!content.includes(oldBlock)) {
      console.error("Konnte CloudResponse Block in server.ts nicht sicher finden.");
      process.exit(1);
    }
    content = content.replace(oldBlock, newBlock);
  }

  if (content.includes("const routingMetadataForLog = pickRoutingMetadataForLog(result);")) {
    content = content.replace(
      "const routingMetadataForLog = pickRoutingMetadataForLog(result);",
      "const routingMetadataForLog = pickRoutingMetadataForLog(resultWithKnowledge);"
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK server.ts: Knowledge-Metadaten werden in der API-Antwort sichtbar.");
  } else {
    console.log("SKIP server.ts: Knowledge-Metadaten scheinen bereits sichtbar zu sein.");
  }
}

function patchFrontendTypes() {
  const file = "frontend/lib/types.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("export interface KnowledgeSearchResult")) {
    const insertAfter = `export interface RoutingDetails {
  route: RouteType;
  reason: string;
  suggestedAgents: string[];
  complexity: RoutingLevel;
  privacyRisk: RoutingLevel;
  decisionNeed: boolean;
  implementationNeed: boolean;
  planningNeed: boolean;
  riskNeed: boolean;
}
`;
    const knowledgeType = `
export interface KnowledgeSearchResult {
  id: string;
  title: string;
  sourcePath: string;
  score: number;
  snippet: string;
  tags: string[];
}
`;
    if (!content.includes(insertAfter)) {
      console.error("Konnte RoutingDetails Block in frontend/lib/types.ts nicht finden.");
      process.exit(1);
    }
    content = content.replace(insertAfter, insertAfter + knowledgeType);
  }

  if (!content.includes("usedKnowledge?: boolean;")) {
    content = content.replace(
      "  councilResult?: unknown;\n}",
      "  councilResult?: unknown;\n  usedKnowledge?: boolean;\n  knowledgeSummary?: string;\n  knowledgeHits?: KnowledgeSearchResult[];\n}"
    );
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Knowledge-Typen ergänzt.");
  } else {
    console.log("SKIP frontend/lib/types.ts: Knowledge-Typen bereits vorhanden.");
  }
}

function patchFrontendPage() {
  const file = "frontend/app/page.tsx";
  let content = read(file);
  const original = content;

  const importLine = 'import { KnowledgeHitsPanel } from "../components/KnowledgeHitsPanel";';
  if (!content.includes(importLine)) {
    const marker = 'import { RoutingMetadataPanel } from "../components/RoutingMetadataPanel";\n';
    if (content.includes(marker)) {
      content = content.replace(marker, marker + importLine + "\n");
    } else {
      console.error("Konnte RoutingMetadataPanel Import in frontend/app/page.tsx nicht finden.");
      process.exit(1);
    }
  }

  if (!content.includes("<KnowledgeHitsPanel response={response} />")) {
    const marker = "                <RoutingMetadataPanel response={response} />\n";
    if (content.includes(marker)) {
      content = content.replace(marker, marker + "                <KnowledgeHitsPanel response={response} />\n");
    } else {
      console.error("Konnte RoutingMetadataPanel Render-Stelle in frontend/app/page.tsx nicht finden.");
      process.exit(1);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/page.tsx: KnowledgeHitsPanel eingebunden.");
  } else {
    console.log("SKIP frontend/app/page.tsx: KnowledgeHitsPanel bereits eingebunden.");
  }
}

patchServer();
patchFrontendTypes();
patchFrontendPage();
console.log("Phase 7.4 Patch abgeschlossen.");

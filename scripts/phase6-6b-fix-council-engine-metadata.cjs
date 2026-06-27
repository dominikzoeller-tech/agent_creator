const fs = require("fs");
const path = require("path");

const targetPath = path.join(process.cwd(), "council-engine.ts");

if (!fs.existsSync(targetPath)) {
  console.error("council-engine.ts wurde im Projekt-Root nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(targetPath, "utf8");
const original = content;
const changes = [];

function ensureImport(importLine) {
  if (!content.includes(importLine)) {
    if (content.startsWith("\n")) {
      content = `\n${importLine}\n${content.slice(1)}`;
    } else {
      content = `${importLine}\n${content}`;
    }
    changes.push(`Import ergänzt: ${importLine}`);
  }
}

ensureImport('import { buildCouncilRoutingMetadata } from "./council-routing-metadata";');
ensureImport('import { RoutingDetails } from "./agent-routing-details";');

// 1) CouncilResult Interface ergänzen
if (!content.includes("suggestedAgents?: string[];")) {
  const interfaceRegex = /(export interface CouncilResult \{[\s\S]*?confidence\?: number; \/\/ 0 bis 1\n\s*extractedOptions\?: string\[\];\n)(\})/;

  if (interfaceRegex.test(content)) {
    content = content.replace(
      interfaceRegex,
      `$1  suggestedAgents?: string[];\n  routingDetails?: RoutingDetails;\n  routingSummary?: string;\n$2`
    );
    changes.push("CouncilResult Interface um suggestedAgents/routingDetails/routingSummary ergänzt.");
  } else {
    console.error("Konnte CouncilResult Interface nicht sicher finden.");
    process.exit(1);
  }
}

// 2) runCouncil Routing-Metadata am Anfang ergänzen
if (!content.includes("const routingMetadata = buildCouncilRoutingMetadata({")) {
  const runCouncilStart = `export async function runCouncil(\n  input: CouncilInput,\n  llm: LLMFn\n): Promise<CouncilResult> {`;

  if (content.includes(runCouncilStart)) {
    content = content.replace(
      runCouncilStart,
      `${runCouncilStart}\n  const routingMetadata = buildCouncilRoutingMetadata({\n    userInput: input.userQuestion,\n    includeCouncilResult: true,\n  });\n`
    );
    changes.push("routingMetadata in runCouncil berechnet.");
  } else {
    console.error("Konnte runCouncil Start nicht sicher finden.");
    process.exit(1);
  }
}

// 3) Vor return validated Metadaten setzen
if (!content.includes("validated.routingSummary = routingMetadata.summary;")) {
  const returnBlock = `  return validated;\n}`;
  const replacement = `  validated.suggestedAgents = routingMetadata.suggestedAgents;\n  validated.routingDetails = routingMetadata.routingDetails;\n  validated.routingSummary = routingMetadata.summary;\n\n  return validated;\n}`;

  const runCouncilIndex = content.indexOf("export async function runCouncil(");
  const returnIndex = content.indexOf(returnBlock, runCouncilIndex);

  if (runCouncilIndex !== -1 && returnIndex !== -1) {
    content = content.slice(0, returnIndex) + replacement + content.slice(returnIndex + returnBlock.length);
    changes.push("validated Result um Routing-Metadaten ergänzt.");
  } else {
    console.error("Konnte return validated in runCouncil nicht sicher finden.");
    process.exit(1);
  }
}

if (content === original) {
  console.log("Keine Änderungen nötig. council-engine.ts enthält bereits alle Routing-Metadaten-Erweiterungen.");
} else {
  fs.writeFileSync(targetPath, content, "utf8");
  console.log("Phase 6.6b Fix angewendet:");
  for (const change of changes) {
    console.log(`- ${change}`);
  }
}

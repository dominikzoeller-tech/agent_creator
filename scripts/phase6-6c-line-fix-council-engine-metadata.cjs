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
    content = `${importLine}\n${content}`;
    changes.push(`Import ergänzt: ${importLine}`);
  }
}

ensureImport('import { buildCouncilRoutingMetadata } from "./council-routing-metadata";');
ensureImport('import { RoutingDetails } from "./agent-routing-details";');

let lines = content.split(/\r?\n/);

// 1) CouncilResult Interface line-basiert ergänzen
if (!content.includes("suggestedAgents?: string[];")) {
  const interfaceStart = lines.findIndex((line) => line.includes("export interface CouncilResult"));
  if (interfaceStart === -1) {
    console.error("Konnte Start von CouncilResult Interface nicht finden.");
    process.exit(1);
  }

  let extractedOptionsLine = -1;
  for (let i = interfaceStart; i < lines.length; i++) {
    if (lines[i].includes("extractedOptions?: string[]")) {
      extractedOptionsLine = i;
      break;
    }
    if (i > interfaceStart && lines[i].trim() === "}") break;
  }

  if (extractedOptionsLine === -1) {
    console.error("Konnte extractedOptions im CouncilResult Interface nicht finden.");
    process.exit(1);
  }

  lines.splice(extractedOptionsLine + 1, 0,
    "  suggestedAgents?: string[];",
    "  routingDetails?: RoutingDetails;",
    "  routingSummary?: string;"
  );
  changes.push("CouncilResult Interface line-basiert ergänzt.");
  content = lines.join("\n");
}

// 2) routingMetadata direkt nach runCouncil Start einfügen
if (!content.includes("const routingMetadata = buildCouncilRoutingMetadata({")) {
  lines = content.split(/\r?\n/);
  const runStart = lines.findIndex((line) => line.includes("export async function runCouncil("));
  if (runStart === -1) {
    console.error("Konnte runCouncil nicht finden.");
    process.exit(1);
  }

  let openingBraceLine = -1;
  for (let i = runStart; i < Math.min(lines.length, runStart + 10); i++) {
    if (lines[i].includes("): Promise<CouncilResult> {") || lines[i].trim().endsWith("{") ) {
      openingBraceLine = i;
      break;
    }
  }

  if (openingBraceLine === -1) {
    console.error("Konnte öffnende Klammer von runCouncil nicht finden.");
    process.exit(1);
  }

  lines.splice(openingBraceLine + 1, 0,
    "  const routingMetadata = buildCouncilRoutingMetadata({",
    "    userInput: input.userQuestion,",
    "    includeCouncilResult: true,",
    "  });",
    ""
  );
  changes.push("routingMetadata in runCouncil eingefügt.");
  content = lines.join("\n");
}

// 3) validated.* vor dem return validated innerhalb runCouncil einfügen
if (!content.includes("validated.routingSummary = routingMetadata.summary;")) {
  lines = content.split(/\r?\n/);
  const runStart = lines.findIndex((line) => line.includes("export async function runCouncil("));
  if (runStart === -1) {
    console.error("Konnte runCouncil nicht finden.");
    process.exit(1);
  }

  let returnLine = -1;
  for (let i = runStart; i < lines.length; i++) {
    if (lines[i].trim() === "return validated;") {
      returnLine = i;
      break;
    }
    if (i > runStart && lines[i].includes("export function renderCouncilMarkdown")) break;
  }

  if (returnLine === -1) {
    console.error("Konnte 'return validated;' in runCouncil nicht finden.");
    process.exit(1);
  }

  lines.splice(returnLine, 0,
    "  validated.suggestedAgents = routingMetadata.suggestedAgents;",
    "  validated.routingDetails = routingMetadata.routingDetails;",
    "  validated.routingSummary = routingMetadata.summary;",
    ""
  );
  changes.push("validated Result um Routing-Metadaten ergänzt.");
  content = lines.join("\n");
}

if (content === original) {
  console.log("Keine Änderungen nötig. council-engine.ts enthält vermutlich bereits alle Routing-Metadaten.");
} else {
  fs.writeFileSync(targetPath, content, "utf8");
  console.log("Phase 6.6c Line-Fix angewendet:");
  for (const change of changes) console.log(`- ${change}`);
}

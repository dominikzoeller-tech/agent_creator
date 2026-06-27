const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'council-engine.ts');

if (!fs.existsSync(targetPath)) {
  console.error('council-engine.ts wurde im Projekt-Root nicht gefunden.');
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf8');
const original = content;

function insertAfterFirstBlankOrStart(text, insertion) {
  if (text.includes(insertion.trim())) return text;
  if (text.startsWith('\n')) return `\n${insertion}${text.slice(1)}`;
  return `${insertion}${text}`;
}

const imports = `import { buildCouncilRoutingMetadata } from "./council-routing-metadata";\nimport { RoutingDetails } from "./agent-routing-details";\n\n`;
content = insertAfterFirstBlankOrStart(content, imports);

const oldInterfacePart = `  confidence?: number; // 0 bis 1\n  extractedOptions?: string[];\n}`;
const newInterfacePart = `  confidence?: number; // 0 bis 1\n  extractedOptions?: string[];\n  suggestedAgents?: string[];\n  routingDetails?: RoutingDetails;\n  routingSummary?: string;\n}`;

if (content.includes(oldInterfacePart) && !content.includes('routingSummary?: string;')) {
  content = content.replace(oldInterfacePart, newInterfacePart);
}

const oldRunCouncilStart = `export async function runCouncil(\n  input: CouncilInput,\n  llm: LLMFn\n): Promise<CouncilResult> {\n  const extractedOptions =`;
const newRunCouncilStart = `export async function runCouncil(\n  input: CouncilInput,\n  llm: LLMFn\n): Promise<CouncilResult> {\n  const routingMetadata = buildCouncilRoutingMetadata({\n    userInput: input.userQuestion,\n    includeCouncilResult: true,\n  });\n\n  const extractedOptions =`;

if (content.includes(oldRunCouncilStart) && !content.includes('const routingMetadata = buildCouncilRoutingMetadata({')) {
  content = content.replace(oldRunCouncilStart, newRunCouncilStart);
}

const oldReturn = `  return validated;\n}`;
const newReturn = `  validated.suggestedAgents = routingMetadata.suggestedAgents;\n  validated.routingDetails = routingMetadata.routingDetails;\n  validated.routingSummary = routingMetadata.summary;\n\n  return validated;\n}`;

if (content.includes(oldReturn) && !content.includes('validated.routingSummary = routingMetadata.summary;')) {
  content = content.replace(oldReturn, newReturn);
}

if (content === original) {
  console.log('Keine Änderungen vorgenommen. council-engine.ts scheint bereits gepatcht zu sein oder die erwarteten Marker wurden nicht gefunden.');
} else {
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('council-engine.ts wurde additiv um Routing-Metadaten erweitert.');
}

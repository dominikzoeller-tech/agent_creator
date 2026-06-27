const fs = require("fs");
const path = require("path");

const filesToInspect = [
  "master-agent.ts",
  "server.ts",
  "council-engine.ts",
  "agent-response.ts",
  "real-llm.ts"
];

const patterns = [
  "export async function",
  "export function",
  "runMasterAgent",
  "runCouncil",
  "handleUserMessage",
  "context",
  "userInput",
  "includeCouncilResult",
  "CouncilResult",
  "answer",
  "recommendation",
  "firstStep",
  "route",
  "usedCouncil",
  "return"
];

function printHeader(title) {
  console.log("\n======================================");
  console.log(title);
  console.log("======================================");
}

function printContext(lines, index, radius = 8) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length - 1, index + radius);
  for (let i = start; i <= end; i++) {
    console.log(`${String(i + 1).padStart(4, " ")}: ${lines[i]}`);
  }
}

printHeader("Phase 7.3 Knowledge Flow Inspector");
console.log("Ziel: exakten Punkt finden, an dem lokaler Knowledge-Kontext in den Agent Flow eingebunden werden kann.");

for (const file of filesToInspect) {
  const full = path.join(process.cwd(), file);
  printHeader(`Datei: ${file}`);

  if (!fs.existsSync(full)) {
    console.log(`MISS ${file}`);
    continue;
  }

  const content = fs.readFileSync(full, "utf8");
  const lines = content.split(/\r?\n/);
  console.log(`OK ${file} (${lines.length} Zeilen, ${content.length} Zeichen)`);

  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((pattern) => lines[i].includes(pattern))) hits.push(i);
  }

  if (hits.length === 0) {
    console.log("Keine Treffer gefunden.");
    continue;
  }

  const printedBuckets = new Set();
  for (const index of hits) {
    const bucket = Math.floor(index / 18);
    if (printedBuckets.has(bucket)) continue;
    printedBuckets.add(bucket);
    console.log(`\n--- Kontext um Zeile ${index + 1} ---`);
    printContext(lines, index, 8);
  }
}

printHeader("Nächster Schritt");
console.log("Bitte die Ausgabe zu master-agent.ts und server.ts in den Chat kopieren.");
console.log("Danach kann Phase 7.3b den Knowledge-Kontext gezielt und additiv in den echten Flow patchen.");

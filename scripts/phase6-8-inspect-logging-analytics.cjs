const fs = require("fs");
const path = require("path");

const filesToInspect = [
  "decision-log.ts",
  "server.ts",
  "frontend/app/api/logs/route.ts",
  "frontend/app/api/analytics/route.ts",
  "frontend/lib/types.ts",
  "frontend/app/analytics/page.tsx"
];

const patterns = [
  "DecisionLog",
  "DecisionLogEntry",
  "writeDecision",
  "append",
  "decision-log.jsonl",
  "recommendation",
  "firstStep",
  "confidence",
  "extractedOptions",
  "suggestedAgents",
  "routingDetails",
  "routingSummary",
  "topRecommendations",
  "topFirstSteps",
  "topPatterns"
];

function printHeader(title) {
  console.log("\n======================================");
  console.log(title);
  console.log("======================================");
}

function printContext(lines, index, radius = 6) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length - 1, index + radius);
  for (let i = start; i <= end; i++) {
    console.log(`${String(i + 1).padStart(4, " ")}: ${lines[i]}`);
  }
}

printHeader("Phase 6.8 Logging / Analytics Inspector");
console.log("Ziel: relevante Stellen finden, um suggestedAgents/routingDetails/routingSummary in Logs und Analytics aufzunehmen.");

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
    const line = lines[i];
    if (patterns.some((pattern) => line.includes(pattern))) {
      hits.push(i);
    }
  }

  if (hits.length === 0) {
    console.log("Keine Treffer für die relevanten Patterns gefunden.");
    continue;
  }

  const printed = new Set();
  for (const index of hits) {
    const bucket = Math.floor(index / 15);
    if (printed.has(bucket)) continue;
    printed.add(bucket);
    console.log(`\n--- Kontext um Zeile ${index + 1} ---`);
    printContext(lines, index, 7);
  }
}

printHeader("Nächster Schritt");
console.log("Bitte die Ausgabe dieser Prüfung in den Chat kopieren, insbesondere die Blöcke zu:");
console.log("- decision-log.ts");
console.log("- server.ts");
console.log("- frontend/app/api/analytics/route.ts");
console.log("Danach kann ein gezielter Phase-6.8-Patch erstellt werden.");

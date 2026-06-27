const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "server.ts");

if (!fs.existsSync(target)) {
  console.error("server.ts wurde im Projekt-Root nicht gefunden.");
  process.exit(1);
}

const content = fs.readFileSync(target, "utf8");
const lines = content.split(/\r?\n/);

const patterns = [
  "appendDecisionLog",
  "DecisionLog",
  "decision-log",
  "log",
  "runCouncil",
  "handleUserMessage",
  "master",
  "ask",
  "/v1/ask",
  "app.post",
  "router",
  "recommendation",
  "firstStep",
  "confidence",
  "councilResult",
  "includeCouncilResult",
  "JSON.stringify",
  "Response.json",
  "res.json",
  "result",
  "route",
  "usedCouncil"
];

function lower(value) {
  return value.toLowerCase();
}

function printHeader(title) {
  console.log("\n======================================");
  console.log(title);
  console.log("======================================");
}

function printContext(index, radius = 10) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length - 1, index + radius);
  for (let i = start; i <= end; i++) {
    console.log(`${String(i + 1).padStart(4, " ")}: ${lines[i]}`);
  }
}

printHeader("Phase 6.8a Server Log Deep Inspector");
console.log(`server.ts: ${lines.length} Zeilen, ${content.length} Zeichen`);
console.log("Case-insensitive Suche nach API-, Log- und Response-Stellen.");

const hits = [];
for (let i = 0; i < lines.length; i++) {
  const lineLower = lower(lines[i]);
  if (patterns.some((pattern) => lineLower.includes(lower(pattern)))) {
    hits.push(i);
  }
}

if (hits.length === 0) {
  console.log("Keine Treffer gefunden. Bitte server.ts manuell prüfen.");
  process.exit(0);
}

const printedBuckets = new Set();
for (const index of hits) {
  const bucket = Math.floor(index / 18);
  if (printedBuckets.has(bucket)) continue;
  printedBuckets.add(bucket);
  console.log(`\n--- Kontext um Zeile ${index + 1} ---`);
  printContext(index, 10);
}

printHeader("Gezielte Hinweise");
console.log("Bitte kopiere diese Ausgabe in den Chat.");
console.log("Besonders wichtig sind Stellen mit:");
console.log("- /v1/ask oder app.post");
console.log("- appendDecisionLog / JSON.stringify / log");
console.log("- response/result/councilResult/recommendation/firstStep/confidence");

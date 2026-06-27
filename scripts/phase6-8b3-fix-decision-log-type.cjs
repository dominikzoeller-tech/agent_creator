const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "decision-log.ts");

if (!fs.existsSync(target)) {
  console.error("decision-log.ts wurde im Projekt-Root nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(target, "utf8");
const original = content;
let lines = content.split(/\r?\n/);

const interfaceStart = lines.findIndex((line) => line.includes("export interface DecisionLogEntry"));
if (interfaceStart === -1) {
  console.error("Konnte export interface DecisionLogEntry nicht finden.");
  process.exit(1);
}

const interfaceEnd = (() => {
  for (let i = interfaceStart + 1; i < lines.length; i++) {
    if (lines[i].trim() === "}") return i;
  }
  return -1;
})();

if (interfaceEnd === -1) {
  console.error("Konnte Ende von DecisionLogEntry nicht finden.");
  process.exit(1);
}

function hasInInterface(text) {
  return lines.slice(interfaceStart, interfaceEnd + 1).some((line) => line.includes(text));
}

const insertions = [];
if (!hasInInterface("suggestedAgents?: string[];")) {
  insertions.push("  suggestedAgents?: string[];");
}
if (!hasInInterface("routingDetails?: unknown;")) {
  insertions.push("  routingDetails?: unknown;");
}
if (!hasInInterface("routingSummary?: string;")) {
  insertions.push("  routingSummary?: string;");
}

if (insertions.length > 0) {
  lines.splice(interfaceEnd, 0, ...insertions);
  content = lines.join("\n");
}

if (content === original) {
  console.log("Keine Änderung nötig: DecisionLogEntry enthält die Routing-Metadaten bereits.");
} else {
  fs.writeFileSync(target, content, "utf8");
  console.log("decision-log.ts wurde erweitert um:");
  for (const item of insertions) console.log(`- ${item.trim()}`);
}

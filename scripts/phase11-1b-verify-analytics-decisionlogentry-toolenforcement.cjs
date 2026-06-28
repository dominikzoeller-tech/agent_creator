const fs = require("fs");
const path = require("path");

const file = "frontend/app/api/analytics/route.ts";
const full = path.join(process.cwd(), file);

function fail(message) {
  console.error(`MISS ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK   ${message}`);
}

function findInterfaceBlock(content, interfaceName) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`\\binterface\\s+${interfaceName}\\b`).test(line));
  if (start === -1) return null;

  let depth = 0;
  let seenOpen = false;
  for (let i = start; i < lines.length; i++) {
    const opens = (lines[i].match(/{/g) || []).length;
    const closes = (lines[i].match(/}/g) || []).length;
    if (opens > 0) seenOpen = true;
    depth += opens - closes;
    if (seenOpen && depth === 0) return lines.slice(start, i + 1).join("\n");
  }
  return null;
}

console.log("======================================");
console.log(" Phase 11.1b Analytics DecisionLogEntry Fix Verify");
console.log("======================================");

if (!fs.existsSync(full)) {
  fail(`${file} nicht gefunden`);
  process.exit(1);
}

const content = fs.readFileSync(full, "utf8");
const block = findInterfaceBlock(content, "DecisionLogEntry");

if (!block) fail("interface DecisionLogEntry nicht gefunden");
else ok("interface DecisionLogEntry gefunden");

if (block && block.includes("toolEnforcement?:")) ok("DecisionLogEntry enthält toolEnforcement?:");
else fail("DecisionLogEntry enthält toolEnforcement?: nicht");

for (const pattern of ["toolEnforcementEntriesCount", "toolEnforcementWouldBlockCount", "topToolEnforcementReasons"]) {
  if (content.includes(pattern)) ok(`${file}: ${pattern}`);
  else fail(`${file}: ${pattern}`);
}

if (process.exitCode) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Analytics DecisionLogEntry ToolEnforcement Fix ist vorbereitet.");

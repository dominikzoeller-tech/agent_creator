const fs = require("fs");
const path = require("path");

const file = "frontend/app/api/analytics/route.ts";
const full = path.join(process.cwd(), file);

function check(pattern) {
  const content = fs.readFileSync(full, "utf8");
  const found = content.includes(pattern);
  console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
  return found;
}

console.log("======================================");
console.log(" Phase 11.1c Analytics ToolEnforcement Entry Cast Verify");
console.log("======================================");

let ok = true;
ok = check("type DecisionLogEntryWithToolEnforcement") && ok;
ok = check("const entriesWithToolEnforcement = entries as DecisionLogEntryWithToolEnforcement[];") && ok;
ok = check("const toolEnforcementEntries = entriesWithToolEnforcement.filter") && ok;
ok = check("toolEnforcementWouldBlockCount") && ok;
ok = check("topToolEnforcementReasons") && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}
console.log("Verify OK. Analytics ToolEnforcement Entry Cast Fix ist vorbereitet.");

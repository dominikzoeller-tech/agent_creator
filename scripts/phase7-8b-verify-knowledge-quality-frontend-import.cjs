const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.log(`MISS ${file}`);
    return false;
  }
  const content = fs.readFileSync(full, "utf8");
  let ok = true;
  for (const pattern of patterns) {
    const found = content.includes(pattern);
    console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
    if (!found) ok = false;
  }
  return ok;
}

console.log("======================================");
console.log(" Phase 7.8b Knowledge Quality Frontend Import Verify");
console.log("======================================");

let ok = true;
ok = check("frontend/lib/knowledge-quality.ts", ["buildKnowledgeQualityReport", "missing-tags", "duplicate-title"]) && ok;
ok = check("frontend/app/api/knowledge-quality/route.ts", ['from "../../../lib/knowledge-quality"', "export async function GET"]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}

console.log("Verify OK. Knowledge Quality API ist für den Frontend-Build erreichbar.");

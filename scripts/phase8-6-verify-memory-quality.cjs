const fs = require("fs");
const path = require("path");
function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) { console.log(`MISS ${file}`); return false; }
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
console.log(" Phase 8.6 Memory Quality Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/memory-quality.ts", ["buildMemoryQualityReport", "missing-tags", "duplicate-title", "old-system-state"]) && ok;
ok = check("frontend/app/api/memory-quality/route.ts", ["buildMemoryQualityReport", "export async function GET"]) && ok;
ok = check("frontend/app/memory-quality/page.tsx", ["Memory Quality Checks", "Memory-Reports", "Nur Einträge mit Issues"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Memory Quality Checks sind vorbereitet.");

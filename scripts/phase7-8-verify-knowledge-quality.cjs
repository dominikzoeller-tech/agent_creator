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
console.log(" Phase 7.8 Knowledge Quality Verify");
console.log("======================================");
let ok = true;
ok = check("knowledge-quality.ts", ["buildKnowledgeQualityReport", "missing-tags", "duplicate-title", "very-short"]) && ok;
ok = check("frontend/app/api/knowledge-quality/route.ts", ["buildKnowledgeQualityReport", "export async function GET"]) && ok;
ok = check("frontend/app/knowledge-quality/page.tsx", ["Knowledge Quality Checks", "Datei-Reports", "Nur Dateien mit Issues"]) && ok;
ok = check("Dockerfile", ["COPY knowledge-quality.ts ./"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Knowledge Quality Checks sind vorbereitet.");

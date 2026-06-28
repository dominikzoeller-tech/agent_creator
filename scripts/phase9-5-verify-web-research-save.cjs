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
console.log(" Phase 9.5 Web Research Save Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/web-research-save.ts", ["saveWebResearch", "saveKnowledgeDocument", "saveMemoryEntry", "project-memory.json"]) && ok;
ok = check("frontend/app/api/web-research-save/route.ts", ["saveWebResearch", "export async function POST"]) && ok;
ok = check("frontend/app/web-research-save/page.tsx", ["Web Research speichern", "Geprüftes Research speichern", "Als Knowledge speichern", "Als Memory speichern"]) && ok;
ok = check("package.json", ["web:research:save:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Save to Knowledge/Memory ist vorbereitet.");

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
console.log(" Phase 7.6 Knowledge Admin Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/api/knowledge/route.ts", ["export async function GET", "export async function POST", "export async function DELETE", "KNOWLEDGE_DIR"]) && ok;
ok = check("frontend/app/knowledge/page.tsx", ["Knowledge Admin", "Neue Datei", "Speichern", "Löschen"]) && ok;
ok = check("docker-compose.internal.yml", ["./knowledge:/knowledge"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Knowledge Admin ist vorbereitet.");

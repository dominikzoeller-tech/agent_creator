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
console.log(" Phase 8.5 Memory Admin Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/api/memory/route.ts", ["export async function GET", "export async function POST", "export async function DELETE", "project-memory.json"]) && ok;
ok = check("frontend/app/memory/page.tsx", ["Project Memory Admin", "Einträge", "Editor", "Speichern", "Löschen"]) && ok;
ok = check("docker-compose.internal.yml", ["./memory:/memory"]) && ok;
if (!ok) {
  console.error("Verify fehlgeschlagen.");
  process.exit(1);
}
console.log("Verify OK. Memory Admin UI ist vorbereitet.");

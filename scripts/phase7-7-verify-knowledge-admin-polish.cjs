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
console.log(" Phase 7.7 Knowledge Admin Polish Verify");
console.log("======================================");

let ok = true;
ok = check("frontend/app/knowledge/page.tsx", ["Knowledge Admin", "href=\"/knowledge\"", "Änderungen werden lokal im knowledge-Ordner gespeichert"]) && ok;
ok = check("frontend/app/page.tsx", ["href=\"/knowledge\""]) && ok;
ok = check("frontend/app/analytics/page.tsx", ["href=\"/knowledge\""]) && ok;

if (!ok) {
  console.error("Verify fehlgeschlagen. Prüfe, ob Navigation in den Page-Dateien ergänzt wurde.");
  process.exit(1);
}

console.log("Verify OK. Knowledge Admin Navigation & UI Polishing ist vorbereitet.");

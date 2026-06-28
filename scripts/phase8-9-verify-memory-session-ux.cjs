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
console.log(" Phase 8.9 Memory Session UX Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/memory-sessions/page.tsx", ["Vorschlag prüfen und bearbeiten", "Geprüften Vorschlag speichern", "window.confirm", "Memory Admin öffnen"]) && ok;
ok = check("frontend/app/page.tsx", ['href="/memory-sessions"']) && ok;
ok = check("frontend/app/memory/page.tsx", ['href="/memory-sessions"']) && ok;
ok = check("frontend/app/memory-quality/page.tsx", ['href="/memory-sessions"']) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Memory Session Navigation & Confirmation UX ist vorbereitet.");

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
console.log(" Phase 10.4 Tool Preflight UI Panel Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/components/ToolPreflightPanel.tsx", ["Tool Preflight", "Erkannte Tool-Kandidaten", "Blockiergründe", "Nicht erkannte Tools anzeigen"]) && ok;
ok = check("frontend/app/page.tsx", ["ToolPreflightPanel", "<ToolPreflightPanel response={response} />"]) && ok;
ok = check("package.json", ["tools:preflight:panel:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Preflight UI Panel ist vorbereitet.");

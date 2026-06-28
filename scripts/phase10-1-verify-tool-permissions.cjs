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
console.log(" Phase 10.1 Tool Permissions Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/tool-permissions.ts", ["buildToolPermissionsMatrix", "evaluateToolPermission", "SensitivityLevel", "ProcessingMode"]) && ok;
ok = check("frontend/app/api/tool-permissions/route.ts", ["buildToolPermissionsMatrix", "export async function GET"]) && ok;
ok = check("frontend/app/tool-permissions/page.tsx", ["Tool Permissions Matrix", "Blockiergründe", "Nur blockiert"]) && ok;
ok = check("package.json", ["tools:permissions:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Permissions Matrix ist vorbereitet.");

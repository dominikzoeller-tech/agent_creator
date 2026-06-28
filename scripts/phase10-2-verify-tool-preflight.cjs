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
console.log(" Phase 10.2 Tool Preflight Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/tool-preflight.ts", ["runToolPreflight", "ToolPreflightResult", "containsSensitiveData", "requiresConfirmation"]) && ok;
ok = check("frontend/app/api/tool-preflight/route.ts", ["runToolPreflight", "export async function GET", "export async function POST"]) && ok;
ok = check("frontend/app/tool-preflight/page.tsx", ["Tool Permission Preflight", "Preflight prüfen", "Blockiergründe"]) && ok;
ok = check("package.json", ["tools:preflight:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Permission Preflight API ist vorbereitet.");

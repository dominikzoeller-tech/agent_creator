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
console.log(" Phase 10.0 Tool Registry Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/tool-registry.ts", ["buildToolRegistry", "AgentToolDefinition", "web-research", "requiresExternalNetwork", "writesData"]) && ok;
ok = check("frontend/app/api/tools/route.ts", ["buildToolRegistry", "export async function GET"]) && ok;
ok = check("frontend/app/tools/page.tsx", ["Tool Registry", "Externe Netzwerktools", "Governance"]) && ok;
ok = check("package.json", ["tools:registry:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Registry Foundation ist vorbereitet.");

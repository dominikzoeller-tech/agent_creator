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
console.log(" Phase 10.6 Tool Enforcement Prep Verify");
console.log("======================================");
let ok = true;
ok = check("tool-enforcement-prep.ts", ["buildToolEnforcementPrep", "TOOL_PERMISSION_ENFORCEMENT_ENABLED", "dryRun", "wouldBlock"]) && ok;
ok = check("server.ts", ["buildToolEnforcementPrep", "const toolEnforcement", "toolEnforcement"]) && ok;
ok = check("decision-log.ts", ["toolEnforcement?: unknown"]) && ok;
ok = check("Dockerfile", ["COPY tool-enforcement-prep.ts ./"]) && ok;
ok = check(".env.example", ["TOOL_PERMISSION_ENFORCEMENT_ENABLED", "TOOL_PERMISSION_ENFORCEMENT_DRY_RUN"]) && ok;
ok = check("package.json", ["tools:enforcement:prep:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Permission Enforcement Prep ist vorbereitet.");

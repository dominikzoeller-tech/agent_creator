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
console.log(" Phase 11.0 Hard Tool Enforcement & Consent Verify");
console.log("======================================");
let ok = true;
ok = check("tool-enforcement-prep.ts", ["consentRequired", "hardBlocked", "TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT"]) && ok;
ok = check("server.ts", ["toolEnforcement.hardBlocked", "Tool Permission Enforcement blockiert"]) && ok;
ok = check("frontend/components/ToolConsentPanel.tsx", ["Tool Consent", "Consent Required", "Hard Enforcement"]) && ok;
ok = check("frontend/app/page.tsx", ["ToolConsentPanel", "<ToolConsentPanel response={response} />"]) && ok;
ok = check(".env.example", ["TOOL_PERMISSION_REQUIRE_EXPLICIT_CONSENT"]) && ok;
ok = check("package.json", ["tools:enforcement:hard:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Hard Tool Enforcement & Consent Flow ist vorbereitet.");

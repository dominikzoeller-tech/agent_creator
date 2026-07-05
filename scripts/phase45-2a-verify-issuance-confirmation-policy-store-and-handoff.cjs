const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!fs.existsSync(full(file))){ console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; }
  return ok;
}
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store.ts", [
  ".split(\"\\n\")",
  "appendFileSync(file, JSON.stringify(value) + \"\\n\", \"utf8\")",
  "humanApprovalTokenIssuanceConfirmedForReviewOnly: true",
  "humanApprovalTokenIssued: false",
  "networkCallPerformed: false",
  "providerExecutionAllowed: false",
  "dryRunOnly: true"
]) && ok;
ok = check("scripts/phase45-3-patch-final-provider-dispatch-human-approval-token-issuance-confirmation-handoff.cjs", ["Phase 45.3", "Phase 46.0"]) && ok;
ok = check("scripts/phase45-3-verify-final-provider-dispatch-human-approval-token-issuance-confirmation-handoff.cjs", ["Phase 45.3 Final Handoff Verify"]) && ok;
ok = check("package.json", ["phase45:3:patch", "phase45:3:verify", "llm:provider-dispatch-human-approval-token-issuance-confirmation:final:check"]) && ok;
if(!ok){ process.exit(1); }
console.log("Hotfix Verify OK.");

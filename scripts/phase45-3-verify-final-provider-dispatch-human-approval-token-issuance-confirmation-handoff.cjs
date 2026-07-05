const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 45.3 Final Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase45-3-final-provider-dispatch-human-approval-token-issuance-confirmation-handoff-release-summary.md", ["Phase 45.3", "Phase 46.0", "humanApprovalTokenIssuanceConfirmedForReviewOnly=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase45-final-provider-dispatch-human-approval-token-issuance-confirmation-handoff-runbook.md", ["phase45:3:verify", "llm:provider-dispatch-human-approval-token-issuance-confirmation:final:check"]) && ok;
ok = check("next-chat-handoff-phase46.md", ["Phase 46.0", "Human Approval Token Issuance Confirmation ist review-only", "Human Approval Token ist nicht issued", "dryRunOnly=true"]) && ok;
ok = check("package.json", ["phase45:3:patch", "phase45:3:verify", "llm:provider-dispatch-human-approval-token-issuance-confirmation:final:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 45.3 Handoff ist vorbereitet.");

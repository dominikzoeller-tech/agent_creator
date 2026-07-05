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
console.log(" Phase 45.1 Token Issuance Confirmation Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store.ts", ["simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy", "humanApprovalTokenIssuanceConfirmedForReviewOnly: true", "humanApprovalTokenIssued: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-confirmation-policy/route.ts", ["simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-confirmation-policy/page.tsx", ["Provider Dispatch Human Approval Token Issuance Confirmation Policy", "Policy Invariants", "humanApprovalTokenIssued=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-confirmation-policy", "Token Issuance Policy", "provider-dispatch-human-approval-token-issuance-confirmation-policy"]) && ok;
ok = check("phase45-1-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit.md", ["Phase 45.1", "Phase 45.2", "humanApprovalTokenIssued=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase45-provider-dispatch-human-approval-token-issuance-confirmation-policy-audit-runbook.md", ["phase45:1:patch", "phase45:1:verify", "/provider-dispatch-human-approval-token-issuance-confirmation-policy"]) && ok;
ok = check("package.json", ["phase45:1:patch", "phase45:1:verify", "llm:provider-dispatch-human-approval-token-issuance-confirmation:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 45.1 ist vorbereitet.");

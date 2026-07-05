const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file);
  let ok = true;
  for(const p of patterns){
    const found = content.includes(p);
    console.log((found ? "OK  " : "MISS") + " " + file + ": " + p);
    if(!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 42.1 Approval Policy Confirmation Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-approval-policy-confirmation-policy-store.ts", [
  "simulateProviderDispatchApprovalPolicyConfirmationPolicy",
  "appendGovernanceAuditEvent",
  "provider_dispatch_approval_policy_confirmation_policy_allowed_no_provider_call",
  "approvalPolicyConfirmedForHumanApprovalOnly: true",
  "approvalCandidateApproved: false",
  "approvalCandidateExecuted: false",
  "approvalCandidateContainsProviderResponse: false",
  "approvalCandidateContainsPromptPayload: false",
  "approvalCandidateContainsSecrets: false",
  "networkCallPerformed: false",
  "providerExecutionAllowed: false",
  "llmCallPerformed: false",
  "dryRunOnly: true"
]) && ok;
ok = check("frontend/app/api/provider-dispatch-approval-policy-confirmation-policy/route.ts", ["simulateProviderDispatchApprovalPolicyConfirmationPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-approval-policy-confirmation-policy/page.tsx", ["Provider Dispatch Approval Policy Confirmation Policy", "Approval Policy Confirmation Policy simulieren", "approvalPolicyConfirmedForHumanApprovalOnly", "approvalCandidateApproved", "approvalCandidateExecuted", "networkCallPerformed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-approval-policy-confirmation-policy", "Approval Confirmation Policy", "provider-dispatch-approval-policy-confirmation-policy"]) && ok;
ok = check("phase42-1-provider-dispatch-approval-policy-confirmation-policy-audit.md", ["Phase 42.1", "Phase 42.2", "approvalPolicyConfirmedForHumanApprovalOnly=true", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase42-provider-dispatch-approval-policy-confirmation-policy-audit-runbook.md", ["phase42:1:patch", "phase42:1:verify"]) && ok;
ok = check("package.json", ["phase42:1:patch", "phase42:1:verify", "llm:provider-dispatch-approval-policy-confirmation-envelope:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 42.1 Approval Policy Confirmation Policy & Audit ist vorbereitet.");

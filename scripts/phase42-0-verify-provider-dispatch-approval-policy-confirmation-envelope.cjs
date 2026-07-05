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
console.log(" Phase 42.0 Approval Policy Confirmation Envelope Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-approval-policy-confirmation-envelope-store.ts", [
  "createProviderDispatchApprovalPolicyConfirmationEnvelope",
  "controlled_provider_dispatch_approval_policy_confirmation_envelope_no_provider_call",
  "providerDispatchApprovalPolicyConfirmationEnvelopePrepared: true",
  "approvalPolicyConfirmationEnvelopePrepared: true",
  "approvalPolicyConfirmationEnvelopePersisted: true",
  "approvalPolicyConfirmedForHumanApprovalOnly: true",
  "approvalCandidateApproved: false",
  "approvalCandidateExecuted: false",
  "networkCallPerformed: false",
  "providerExecutionAllowed: false",
  "llmCallPerformed: false",
  "dryRunOnly: true"
]) && ok;
ok = check("frontend/app/api/provider-dispatch-approval-policy-confirmation-envelope/route.ts", ["createProviderDispatchApprovalPolicyConfirmationEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-approval-policy-confirmation-envelope/page.tsx", [
  "Provider Dispatch Approval Policy Confirmation Envelope",
  "Policy Confirmation Envelope vorbereiten",
  "approvalPolicyConfirmedForHumanApprovalOnly",
  "approvalCandidateApproved",
  "approvalCandidateExecuted",
  "networkCallPerformed"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-approval-policy-confirmation-envelope",
  "Approval Policy Confirmation",
  "provider-dispatch-approval-policy-confirmation-envelope"
]) && ok;
ok = check("phase42-0-provider-dispatch-approval-policy-confirmation-envelope.md", [
  "Phase 42.0",
  "Phase 42.1",
  "providerDispatchApprovalPolicyConfirmationEnvelopePrepared=true",
  "approvalPolicyConfirmationEnvelopePrepared=true",
  "approvalPolicyConfirmationEnvelopePersisted=true",
  "approvalPolicyConfirmedForHumanApprovalOnly=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase42-provider-dispatch-approval-policy-confirmation-envelope-runbook.md", ["phase42:0:patch", "phase42:0:verify"]) && ok;
ok = check("package.json", ["phase42:0:patch", "phase42:0:verify", "llm:provider-dispatch-approval-policy-confirmation-envelope:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 42.0 Provider Dispatch Approval Policy Confirmation Envelope ist vorbereitet.");

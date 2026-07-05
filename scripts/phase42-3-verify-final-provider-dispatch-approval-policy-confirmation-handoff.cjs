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
console.log(" Phase 42.3 Final Provider Dispatch Approval Policy Confirmation Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase42-3-final-provider-dispatch-approval-policy-confirmation-handoff-release-summary.md", [
  "Phase 42.3",
  "Phase 43.0",
  "providerDispatchApprovalPolicyConfirmationEnvelopePrepared=true",
  "approvalPolicyConfirmationEnvelopePrepared=true",
  "approvalPolicyConfirmationEnvelopePersisted=true",
  "approvalPolicyConfirmedForHumanApprovalOnly=true",
  "approvalCandidateReadyForHumanApproval=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "approvalCandidateContainsProviderResponse=false",
  "approvalCandidateContainsPromptPayload=false",
  "approvalCandidateContainsSecrets=false",
  "releaseCandidateReadyForHumanReview=true",
  "releaseCandidateApproved=false",
  "releaseCandidateExecuted=false",
  "commandEnvelopeExecuted=false",
  "executionGateOpen=false",
  "finalDispatchAllowed=false",
  "networkCallAllowed=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase42-final-provider-dispatch-approval-policy-confirmation-handoff-runbook.md", ["phase42:3:verify", "llm:provider-dispatch-approval-policy-confirmation-envelope:final:check", "phase42:2:smoke"]) && ok;
ok = check("next-chat-handoff-phase43.md", ["Phase 43.0", "Provider Dispatch Human Approval Token Envelope", "Approval Policy Confirmation bestätigt nur Human-Approval-only", "Approval Candidate ist nicht approved", "Approval Candidate ist nicht ausgeführt", "dryRunOnly=true", "kein realer Provider Call", "Cleanup separat planen"]) && ok;
ok = check("package.json", ["phase42:3:patch", "phase42:3:verify", "llm:provider-dispatch-approval-policy-confirmation-envelope:final:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 42.3 Final Provider Dispatch Approval Policy Confirmation Handoff ist vorbereitet.");

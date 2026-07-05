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
console.log(" Phase 41.3 Final Provider Dispatch Approval Candidate Envelope Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase41-3-final-provider-dispatch-approval-candidate-envelope-handoff-release-summary.md", [
  "Phase 41.3",
  "Phase 42.0",
  "providerDispatchApprovalCandidateEnvelopePrepared=true",
  "approvalCandidateEnvelopePrepared=true",
  "approvalCandidateEnvelopePersisted=true",
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
ok = check("docs/phase41-final-provider-dispatch-approval-candidate-envelope-handoff-runbook.md", ["phase41:3:verify", "llm:provider-dispatch-approval-candidate-envelope:final:check", "phase41:2:smoke"]) && ok;
ok = check("next-chat-handoff-phase42.md", ["Phase 42.0", "Provider Dispatch Approval Policy Confirmation Envelope", "Approval Candidate ist Human-Approval-ready", "Approval Candidate ist nicht approved", "Approval Candidate ist nicht ausgeführt", "dryRunOnly=true", "kein realer Provider Call", "Cleanup separat planen"]) && ok;
ok = check("package.json", ["phase41:3:patch", "phase41:3:verify", "llm:provider-dispatch-approval-candidate-envelope:final:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 41.3 Final Provider Dispatch Approval Candidate Envelope Handoff ist vorbereitet.");

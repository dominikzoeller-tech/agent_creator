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
console.log(" Phase 43.3 Final Provider Dispatch Human Approval Token Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase43-3-final-provider-dispatch-human-approval-token-handoff-release-summary.md", [
  "Phase 43.3",
  "Phase 44.0",
  "providerDispatchHumanApprovalTokenEnvelopePrepared=true",
  "humanApprovalTokenEnvelopePrepared=true",
  "humanApprovalTokenEnvelopePersisted=true",
  "humanApprovalTokenReadyForHumanApproval=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "approvalPolicyConfirmedForHumanApprovalOnly=true",
  "approvalCandidateReadyForHumanApproval=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "approvalCandidateContainsProviderResponse=false",
  "approvalCandidateContainsPromptPayload=false",
  "approvalCandidateContainsSecrets=false",
  "commandEnvelopeExecuted=false",
  "executionGateOpen=false",
  "finalDispatchAllowed=false",
  "networkCallAllowed=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase43-final-provider-dispatch-human-approval-token-handoff-runbook.md", ["phase43:3:verify", "llm:provider-dispatch-human-approval-token-envelope:final:check", "phase43:2:smoke"]) && ok;
ok = check("next-chat-handoff-phase44.md", ["Phase 44.0", "Provider Dispatch Human Approval Token Issuance Candidate", "Human Approval Token ist Human-Approval-ready", "Human Approval Token ist nicht issued", "Human Approval Token ist nicht aktiviert", "Human Approval Token ist nicht konsumiert", "dryRunOnly=true", "kein realer Provider Call", "Cleanup separat planen"]) && ok;
ok = check("package.json", ["phase43:3:patch", "phase43:3:verify", "llm:provider-dispatch-human-approval-token-envelope:final:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 43.3 Final Provider Dispatch Human Approval Token Handoff ist vorbereitet.");

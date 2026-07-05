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
console.log(" Phase 47.3 Final Provider Dispatch Human Approval Token Issuance Receipt Handoff Verify");
console.log("======================================");
let ok = true;
ok = check("phase47-3-final-provider-dispatch-human-approval-token-issuance-receipt-handoff-release-summary.md", [
  "Phase 47.3",
  "Phase 48.0",
  "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded=true",
  "humanApprovalTokenIssuanceReceiptPrepared=true",
  "humanApprovalTokenIssuanceReceiptPersisted=true",
  "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true",
  "humanApprovalTokenIssuanceLedgerEntryPrepared=true",
  "humanApprovalTokenIssuanceConfirmedForReviewOnly=true",
  "humanApprovalTokenReadyForIssuanceReview=true",
  "humanApprovalTokenReadyForHumanApproval=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "commandEnvelopeExecuted=false",
  "executionGateOpen=false",
  "finalDispatchAllowed=false",
  "networkCallAllowed=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase47-final-provider-dispatch-human-approval-token-issuance-receipt-handoff-runbook.md", ["phase47:3:verify", "llm:provider-dispatch-human-approval-token-issuance-receipt:final:check", "phase47:2:smoke"]) && ok;
ok = check("next-chat-handoff-phase48.md", ["Phase 48.0", "Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement", "Human Approval Token Issuance Receipt ist receipt-only", "Human Approval Token ist nicht issued", "Human Approval Token ist nicht aktiviert", "Human Approval Token ist nicht konsumiert", "dryRunOnly=true", "kein realer Provider Call", "Cleanup separat planen"]) && ok;
ok = check("package.json", ["phase47:3:patch", "phase47:3:verify", "llm:provider-dispatch-human-approval-token-issuance-receipt:final:check"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 47.3 Final Provider Dispatch Human Approval Token Issuance Receipt Handoff ist vorbereitet.");

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
console.log(" Phase 44.2 Issuance Candidate Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-candidate-dashboard/page.tsx", [
  "Provider Dispatch Human Approval Token Issuance Candidate Dashboard",
  "Issuance Candidate Übersicht",
  "providerDispatchHumanApprovalTokenIssuanceCandidatePrepared=true",
  "humanApprovalTokenReadyForIssuanceReview=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-human-approval-token-issuance-candidate-dashboard",
  "Token Issuance Dashboard",
  "provider-dispatch-human-approval-token-issuance-candidate-dashboard"
]) && ok;
ok = check("scripts/phase44-2-provider-dispatch-human-approval-token-issuance-candidate-dashboard-smoke.cjs", [
  "Phase 44.2 Provider Dispatch Human Approval Token Issuance Candidate Dashboard Smoke",
  "UI Issuance Candidate Dashboard",
  "API Issuance Candidate Policy"
]) && ok;
ok = check("phase44-2-provider-dispatch-human-approval-token-issuance-candidate-dashboard-smoke.md", [
  "Phase 44.2",
  "Provider Dispatch Human Approval Token Issuance Candidate Dashboard",
  "Phase 44.3",
  "humanApprovalTokenReadyForIssuanceReview=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase44-provider-dispatch-human-approval-token-issuance-candidate-dashboard-smoke-runbook.md", [
  "phase44:2:verify",
  "phase44:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase44:2:patch",
  "phase44:2:verify",
  "phase44:2:smoke",
  "llm:provider-dispatch-human-approval-token-issuance-candidate:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 44.2 Provider Dispatch Human Approval Token Issuance Candidate Dashboard & Smoke ist vorbereitet.");

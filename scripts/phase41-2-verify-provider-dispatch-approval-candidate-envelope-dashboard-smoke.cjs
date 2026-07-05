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
console.log(" Phase 41.2 Approval Candidate Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-approval-candidate-envelope-dashboard/page.tsx", [
  "Provider Dispatch Approval Candidate Envelope Dashboard",
  "Provider Dispatch Approval Candidate Envelope Übersicht",
  "approvalCandidateReadyForHumanApproval=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "approvalCandidateContainsProviderResponse=false",
  "approvalCandidateContainsPromptPayload=false",
  "approvalCandidateContainsSecrets=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-approval-candidate-envelope-dashboard",
  "Approval Dashboard",
  "provider-dispatch-approval-candidate-envelope-dashboard"
]) && ok;
ok = check("scripts/phase41-2-provider-dispatch-approval-candidate-envelope-dashboard-smoke.cjs", [
  "Phase 41.2 Provider Dispatch Approval Candidate Envelope Dashboard Smoke",
  "UI Approval Candidate Dashboard",
  "API Approval Candidate Policy"
]) && ok;
ok = check("phase41-2-provider-dispatch-approval-candidate-envelope-dashboard-smoke.md", [
  "Phase 41.2",
  "Provider Dispatch Approval Candidate Envelope Dashboard",
  "Phase 41.3",
  "approvalCandidateReadyForHumanApproval=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase41-provider-dispatch-approval-candidate-envelope-dashboard-smoke-runbook.md", [
  "phase41:2:verify",
  "phase41:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase41:2:patch",
  "phase41:2:verify",
  "phase41:2:smoke",
  "llm:provider-dispatch-approval-candidate-envelope:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 41.2 Provider Dispatch Approval Candidate Envelope Dashboard & Smoke ist vorbereitet.");

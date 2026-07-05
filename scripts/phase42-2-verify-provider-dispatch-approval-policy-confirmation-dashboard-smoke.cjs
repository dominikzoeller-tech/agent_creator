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
console.log(" Phase 42.2 Approval Policy Confirmation Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-approval-policy-confirmation-dashboard/page.tsx", [
  "Provider Dispatch Approval Policy Confirmation Dashboard",
  "Approval Policy Confirmation Übersicht",
  "approvalPolicyConfirmedForHumanApprovalOnly=true",
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
  "/provider-dispatch-approval-policy-confirmation-dashboard",
  "Approval Confirmation Dashboard",
  "provider-dispatch-approval-policy-confirmation-dashboard"
]) && ok;
ok = check("scripts/phase42-2-provider-dispatch-approval-policy-confirmation-dashboard-smoke.cjs", [
  "Phase 42.2 Provider Dispatch Approval Policy Confirmation Dashboard Smoke",
  "UI Approval Policy Confirmation Dashboard",
  "API Approval Policy Confirmation Policy"
]) && ok;
ok = check("phase42-2-provider-dispatch-approval-policy-confirmation-dashboard-smoke.md", [
  "Phase 42.2",
  "Provider Dispatch Approval Policy Confirmation Dashboard",
  "Phase 42.3",
  "approvalPolicyConfirmedForHumanApprovalOnly=true",
  "approvalCandidateApproved=false",
  "approvalCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase42-provider-dispatch-approval-policy-confirmation-dashboard-smoke-runbook.md", [
  "phase42:2:verify",
  "phase42:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase42:2:patch",
  "phase42:2:verify",
  "phase42:2:smoke",
  "llm:provider-dispatch-approval-policy-confirmation-envelope:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 42.2 Provider Dispatch Approval Policy Confirmation Dashboard & Smoke ist vorbereitet.");

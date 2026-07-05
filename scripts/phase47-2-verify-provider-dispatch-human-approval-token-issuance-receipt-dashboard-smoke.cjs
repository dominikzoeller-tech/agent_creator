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
console.log(" Phase 47.2 Issuance Receipt Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-receipt-dashboard/page.tsx", [
  "Provider Dispatch Human Approval Token Issuance Receipt Dashboard",
  "Issuance Receipt Übersicht",
  "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded=true",
  "humanApprovalTokenIssuanceReceiptPrepared=true",
  "humanApprovalTokenIssuanceReceiptPersisted=true",
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
  "/provider-dispatch-human-approval-token-issuance-receipt-dashboard",
  "Token Issuance Receipt Dashboard",
  "provider-dispatch-human-approval-token-issuance-receipt-dashboard"
]) && ok;
ok = check("scripts/phase47-2-provider-dispatch-human-approval-token-issuance-receipt-dashboard-smoke.cjs", [
  "Phase 47.2 Provider Dispatch Human Approval Token Issuance Receipt Dashboard Smoke",
  "UI Issuance Receipt Dashboard",
  "API Issuance Receipt Policy"
]) && ok;
ok = check("phase47-2-provider-dispatch-human-approval-token-issuance-receipt-dashboard-smoke.md", [
  "Phase 47.2",
  "Provider Dispatch Human Approval Token Issuance Receipt Dashboard",
  "Phase 47.3",
  "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase47-provider-dispatch-human-approval-token-issuance-receipt-dashboard-smoke-runbook.md", [
  "phase47:2:verify",
  "phase47:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase47:2:patch",
  "phase47:2:verify",
  "phase47:2:smoke",
  "llm:provider-dispatch-human-approval-token-issuance-receipt:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 47.2 Provider Dispatch Human Approval Token Issuance Receipt Dashboard & Smoke ist vorbereitet.");

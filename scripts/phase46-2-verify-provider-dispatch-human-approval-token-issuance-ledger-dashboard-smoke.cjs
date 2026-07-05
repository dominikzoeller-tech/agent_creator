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
console.log(" Phase 46.2 Issuance Ledger Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-ledger-dashboard/page.tsx", [
  "Provider Dispatch Human Approval Token Issuance Ledger Dashboard",
  "Issuance Ledger Übersicht",
  "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true",
  "humanApprovalTokenIssuanceLedgerEntryPrepared=true",
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
  "/provider-dispatch-human-approval-token-issuance-ledger-dashboard",
  "Issuance Ledger Dashboard",
  "provider-dispatch-human-approval-token-issuance-ledger-dashboard"
]) && ok;
ok = check("scripts/phase46-2-provider-dispatch-human-approval-token-issuance-ledger-dashboard-smoke.cjs", [
  "Phase 46.2 Provider Dispatch Human Approval Token Issuance Ledger Dashboard Smoke",
  "UI Issuance Ledger Dashboard",
  "API Issuance Ledger Policy"
]) && ok;
ok = check("phase46-2-provider-dispatch-human-approval-token-issuance-ledger-dashboard-smoke.md", [
  "Phase 46.2",
  "Provider Dispatch Human Approval Token Issuance Ledger Dashboard",
  "Phase 46.3",
  "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true",
  "humanApprovalTokenIssued=false",
  "humanApprovalTokenActivated=false",
  "humanApprovalTokenConsumed=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase46-provider-dispatch-human-approval-token-issuance-ledger-dashboard-smoke-runbook.md", [
  "phase46:2:verify",
  "phase46:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase46:2:patch",
  "phase46:2:verify",
  "phase46:2:smoke",
  "llm:provider-dispatch-human-approval-token-issuance-ledger:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 46.2 Provider Dispatch Human Approval Token Issuance Ledger Dashboard & Smoke ist vorbereitet.");

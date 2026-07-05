const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 46.0 Human Approval Token Issuance Ledger Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-store.ts", ["createProviderDispatchHumanApprovalTokenIssuanceLedgerEntry", "controlled_provider_dispatch_human_approval_token_issuance_ledger_no_provider_call", "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true", "humanApprovalTokenIssuanceLedgerEntryPrepared: true", "humanApprovalTokenIssuanceLedgerEntryPersisted: true", "humanApprovalTokenIssuanceConfirmedForReviewOnly: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-ledger/route.ts", ["createProviderDispatchHumanApprovalTokenIssuanceLedgerEntry", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-ledger/page.tsx", ["Provider Dispatch Human Approval Token Issuance Ledger", "Ledger Entry schreiben", "humanApprovalTokenIssuanceConfirmedForReviewOnly", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-ledger", "Token Issuance Ledger", "provider-dispatch-human-approval-token-issuance-ledger"]) && ok;
ok = check("phase46-0-provider-dispatch-human-approval-token-issuance-ledger.md", ["Phase 46.0", "Phase 46.1", "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded=true", "humanApprovalTokenIssuanceLedgerEntryPrepared=true", "humanApprovalTokenIssuanceConfirmedForReviewOnly=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase46-provider-dispatch-human-approval-token-issuance-ledger-runbook.md", ["phase46:0:patch", "phase46:0:verify"]) && ok;
ok = check("package.json", ["phase46:0:patch", "phase46:0:verify", "llm:provider-dispatch-human-approval-token-issuance-ledger:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 46.0 Provider Dispatch Human Approval Token Issuance Ledger ist vorbereitet.");

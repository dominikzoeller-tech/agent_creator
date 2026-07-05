const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 47.0 Human Approval Token Issuance Receipt Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-store.ts", ["createProviderDispatchHumanApprovalTokenIssuanceReceipt", "controlled_provider_dispatch_human_approval_token_issuance_receipt_no_provider_call", "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded: true", "humanApprovalTokenIssuanceReceiptPrepared: true", "humanApprovalTokenIssuanceReceiptPersisted: true", "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true", ".split(\"\\n\")", "JSON.stringify(receipt) + \"\\n\""]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt/route.ts", ["createProviderDispatchHumanApprovalTokenIssuanceReceipt", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-receipt/page.tsx", ["Provider Dispatch Human Approval Token Issuance Receipt", "Receipt schreiben", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-receipt", "Token Issuance Receipt", "provider-dispatch-human-approval-token-issuance-receipt"]) && ok;
ok = check("phase47-0-provider-dispatch-human-approval-token-issuance-receipt.md", ["Phase 47.0", "Phase 47.1", "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded=true", "humanApprovalTokenIssuanceReceiptPrepared=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase47-provider-dispatch-human-approval-token-issuance-receipt-runbook.md", ["phase47:0:patch", "phase47:0:verify"]) && ok;
ok = check("package.json", ["phase47:0:patch", "phase47:0:verify", "llm:provider-dispatch-human-approval-token-issuance-receipt:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 47.0 Provider Dispatch Human Approval Token Issuance Receipt ist vorbereitet.");

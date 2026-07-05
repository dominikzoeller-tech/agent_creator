const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 48.0 Human Approval Token Issuance Receipt Acknowledgement Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-store.ts", ["createProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement", "controlled_provider_dispatch_human_approval_token_issuance_receipt_acknowledgement_no_provider_call", "providerDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementRecorded: true", "humanApprovalTokenIssuanceReceiptAcknowledgementPrepared: true", "humanApprovalTokenIssuanceReceiptAcknowledgementPersisted: true", "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true", ".split(\"\\n\")", "JSON.stringify(value) + \"\\n\""]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement/route.ts", ["createProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgement", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement/page.tsx", ["Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement", "Acknowledgement schreiben", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement", "Token Issuance Receipt Acknowledgement", "provider-dispatch-human-approval-token-issuance-receipt-acknowledgement"]) && ok;
ok = check("phase48-0-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement.md", ["Phase 48.0", "Phase 48.1", "providerDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementRecorded=true", "humanApprovalTokenIssuanceReceiptAcknowledgementPrepared=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase48-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-runbook.md", ["phase48:0:patch", "phase48:0:verify"]) && ok;
ok = check("package.json", ["phase48:0:patch", "phase48:0:verify", "llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 48.0 Provider Dispatch Human Approval Token Issuance Receipt Acknowledgement ist vorbereitet.");

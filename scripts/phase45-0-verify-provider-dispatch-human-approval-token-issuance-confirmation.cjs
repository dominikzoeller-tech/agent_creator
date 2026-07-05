const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 45.0 Human Approval Token Issuance Confirmation Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-confirmation-store.ts", ["createProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope", "controlled_provider_dispatch_human_approval_token_issuance_confirmation_no_provider_call", "providerDispatchHumanApprovalTokenIssuanceConfirmationPrepared: true", "humanApprovalTokenIssuanceConfirmationPrepared: true", "humanApprovalTokenIssuanceConfirmationPersisted: true", "humanApprovalTokenIssuanceConfirmedForReviewOnly: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-confirmation/route.ts", ["createProviderDispatchHumanApprovalTokenIssuanceConfirmationEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-confirmation/page.tsx", ["Provider Dispatch Human Approval Token Issuance Confirmation", "Issuance Confirmation vorbereiten", "humanApprovalTokenIssuanceConfirmedForReviewOnly", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-confirmation", "Token Issuance Confirmation", "provider-dispatch-human-approval-token-issuance-confirmation"]) && ok;
ok = check("phase45-0-provider-dispatch-human-approval-token-issuance-confirmation.md", ["Phase 45.0", "Phase 45.1", "providerDispatchHumanApprovalTokenIssuanceConfirmationPrepared=true", "humanApprovalTokenIssuanceConfirmedForReviewOnly=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase45-provider-dispatch-human-approval-token-issuance-confirmation-runbook.md", ["phase45:0:patch", "phase45:0:verify"]) && ok;
ok = check("package.json", ["phase45:0:patch", "phase45:0:verify", "llm:provider-dispatch-human-approval-token-issuance-confirmation:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 45.0 Provider Dispatch Human Approval Token Issuance Confirmation ist vorbereitet.");

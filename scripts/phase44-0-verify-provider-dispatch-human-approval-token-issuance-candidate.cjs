const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 44.0 Human Approval Token Issuance Candidate Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-candidate-store.ts", ["createProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelope", "controlled_provider_dispatch_human_approval_token_issuance_candidate_no_provider_call", "providerDispatchHumanApprovalTokenIssuanceCandidatePrepared: true", "humanApprovalTokenIssuanceCandidatePrepared: true", "humanApprovalTokenIssuanceCandidatePersisted: true", "humanApprovalTokenReadyForIssuanceReview: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-candidate/route.ts", ["createProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-candidate/page.tsx", ["Provider Dispatch Human Approval Token Issuance Candidate", "Issuance Candidate vorbereiten", "humanApprovalTokenReadyForIssuanceReview", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-candidate", "Token Issuance Candidate", "provider-dispatch-human-approval-token-issuance-candidate"]) && ok;
ok = check("phase44-0-provider-dispatch-human-approval-token-issuance-candidate.md", ["Phase 44.0", "Phase 44.1", "providerDispatchHumanApprovalTokenIssuanceCandidatePrepared=true", "humanApprovalTokenReadyForIssuanceReview=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase44-provider-dispatch-human-approval-token-issuance-candidate-runbook.md", ["phase44:0:patch", "phase44:0:verify"]) && ok;
ok = check("package.json", ["phase44:0:patch", "phase44:0:verify", "llm:provider-dispatch-human-approval-token-issuance-candidate:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 44.0 Provider Dispatch Human Approval Token Issuance Candidate ist vorbereitet.");

const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 43.0 Human Approval Token Envelope Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-envelope-store.ts", ["createProviderDispatchHumanApprovalTokenEnvelope", "controlled_provider_dispatch_human_approval_token_envelope_no_provider_call", "providerDispatchHumanApprovalTokenEnvelopePrepared: true", "humanApprovalTokenEnvelopePrepared: true", "humanApprovalTokenEnvelopePersisted: true", "humanApprovalTokenReadyForHumanApproval: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-envelope/route.ts", ["createProviderDispatchHumanApprovalTokenEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-envelope/page.tsx", ["Provider Dispatch Human Approval Token Envelope", "Human Approval Token Envelope vorbereiten", "humanApprovalTokenReadyForHumanApproval", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-envelope", "Human Approval Token", "provider-dispatch-human-approval-token-envelope"]) && ok;
ok = check("phase43-0-provider-dispatch-human-approval-token-envelope.md", ["Phase 43.0", "Phase 43.1", "providerDispatchHumanApprovalTokenEnvelopePrepared=true", "humanApprovalTokenReadyForHumanApproval=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase43-provider-dispatch-human-approval-token-envelope-runbook.md", ["phase43:0:patch", "phase43:0:verify"]) && ok;
ok = check("package.json", ["phase43:0:patch", "phase43:0:verify", "llm:provider-dispatch-human-approval-token-envelope:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 43.0 Provider Dispatch Human Approval Token Envelope ist vorbereitet.");

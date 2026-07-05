const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 43.1 Human Approval Token Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-policy-store.ts", ["simulateProviderDispatchHumanApprovalTokenPolicy", "appendGovernanceAuditEvent", "provider_dispatch_human_approval_token_policy_allowed_no_provider_call", "humanApprovalTokenReadyForHumanApproval: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-policy/route.ts", ["simulateProviderDispatchHumanApprovalTokenPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-policy/page.tsx", ["Provider Dispatch Human Approval Token Policy", "Human Approval Token Policy simulieren", "humanApprovalTokenReadyForHumanApproval", "humanApprovalTokenIssued", "humanApprovalTokenActivated", "humanApprovalTokenConsumed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-policy", "Human Approval Token Policy", "provider-dispatch-human-approval-token-policy"]) && ok;
ok = check("phase43-1-provider-dispatch-human-approval-token-policy-audit.md", ["Phase 43.1", "Phase 43.2", "humanApprovalTokenReadyForHumanApproval=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase43-provider-dispatch-human-approval-token-policy-audit-runbook.md", ["phase43:1:patch", "phase43:1:verify"]) && ok;
ok = check("package.json", ["phase43:1:patch", "phase43:1:verify", "llm:provider-dispatch-human-approval-token-envelope:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 43.1 Provider Dispatch Human Approval Token Policy & Audit ist vorbereitet.");

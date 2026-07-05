const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file);
  let ok = true;
  for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 41.1 Provider Dispatch Approval Candidate Envelope Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-approval-candidate-envelope-policy-store.ts", ["simulateProviderDispatchApprovalCandidateEnvelopePolicy", "appendGovernanceAuditEvent", "provider_dispatch_approval_candidate_envelope_policy_allowed_human_approval_only_no_provider_call", "providerDispatchApprovalCandidateEnvelopePrepared: true", "approvalCandidateReadyForHumanApproval: true", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "approvalCandidateContainsProviderResponse: false", "approvalCandidateContainsPromptPayload: false", "approvalCandidateContainsSecrets: false", "networkCallAllowed: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false"]) && ok;
ok = check("frontend/app/api/provider-dispatch-approval-candidate-envelope-policy/route.ts", ["simulateProviderDispatchApprovalCandidateEnvelopePolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-approval-candidate-envelope-policy/page.tsx", ["Provider Dispatch Approval Candidate Envelope Policy", "Provider Dispatch Approval Candidate Envelope Policy simulieren", "approvalCandidateReadyForHumanApproval", "approvalCandidateApproved", "approvalCandidateExecuted", "approvalCandidateContainsProviderResponse", "approvalCandidateContainsPromptPayload", "approvalCandidateContainsSecrets", "networkCallPerformed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-approval-candidate-envelope-policy", "Dispatch Approval Policy", "provider-dispatch-approval-candidate-envelope-policy"]) && ok;
ok = check("phase41-1-provider-dispatch-approval-candidate-envelope-policy-audit.md", ["Phase 41.1", "Phase 41.2", "providerDispatchApprovalCandidateEnvelopePrepared=true", "approvalCandidateReadyForHumanApproval=true", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "approvalCandidateContainsProviderResponse=false", "approvalCandidateContainsPromptPayload=false", "approvalCandidateContainsSecrets=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase41-provider-dispatch-approval-candidate-envelope-policy-audit-runbook.md", ["phase41:1:patch", "phase41:1:verify"]) && ok;
ok = check("package.json", ["phase41:1:patch", "phase41:1:verify", "llm:provider-dispatch-approval-candidate-envelope:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 41.1 Provider Dispatch Approval Candidate Envelope Policy & Audit ist vorbereitet.");

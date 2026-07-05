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
console.log(" Phase 41.0 Provider Dispatch Approval Candidate Envelope Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-approval-candidate-envelope-store.ts", ["createProviderDispatchApprovalCandidateEnvelope", "controlled_provider_dispatch_approval_candidate_envelope_no_provider_call", "providerDispatchApprovalCandidateEnvelopePrepared: true", "approvalCandidateReadyForHumanApproval: true", "approvalCandidateApproved: false", "approvalCandidateExecuted: false", "approvalCandidateContainsProviderResponse: false", "approvalCandidateContainsPromptPayload: false", "approvalCandidateContainsSecrets: false", "networkCallAllowed: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false"]) && ok;
ok = check("frontend/app/api/provider-dispatch-approval-candidate-envelope/route.ts", ["createProviderDispatchApprovalCandidateEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-approval-candidate-envelope/page.tsx", ["Provider Dispatch Approval Candidate Envelope", "Provider Dispatch Approval Candidate Envelope vorbereiten", "approvalCandidateReadyForHumanApproval", "approvalCandidateApproved", "approvalCandidateExecuted", "approvalCandidateContainsProviderResponse", "approvalCandidateContainsPromptPayload", "approvalCandidateContainsSecrets", "networkCallPerformed"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-approval-candidate-envelope", "Dispatch Approval Candidate", "provider-dispatch-approval-candidate-envelope"]) && ok;
ok = check("phase41-0-provider-dispatch-approval-candidate-envelope.md", ["Phase 41.0", "Phase 41.1", "providerDispatchApprovalCandidateEnvelopePrepared=true", "approvalCandidateReadyForHumanApproval=true", "approvalCandidateApproved=false", "approvalCandidateExecuted=false", "approvalCandidateContainsProviderResponse=false", "approvalCandidateContainsPromptPayload=false", "approvalCandidateContainsSecrets=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase41-provider-dispatch-approval-candidate-envelope-runbook.md", ["phase41:0:patch", "phase41:0:verify"]) && ok;
ok = check("package.json", ["phase41:0:patch", "phase41:0:verify", "llm:provider-dispatch-approval-candidate-envelope:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 41.0 Provider Dispatch Approval Candidate Envelope ist vorbereitet.");

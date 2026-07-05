const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 40.3 Final Provider Dispatch Release Candidate Envelope Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase40-3-final-provider-dispatch-release-candidate-envelope-handoff-release-summary.md",["Phase 40.3","Phase 41.0","providerDispatchReleaseCandidateEnvelopePrepared=true","releaseCandidateEnvelopePrepared=true","releaseCandidateEnvelopePersisted=true","releaseCandidateReadyForHumanReview=true","releaseCandidateApproved=false","releaseCandidateExecuted=false","releaseCandidateContainsProviderResponse=false","releaseCandidateContainsPromptPayload=false","releaseCandidateContainsSecrets=false","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase40-final-provider-dispatch-release-candidate-envelope-handoff-runbook.md",["phase40:3:verify","llm:provider-dispatch-release-candidate-envelope:final:check","phase40:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase41.md",["Phase 41.0","Provider Dispatch Approval Candidate Envelope","Release Candidate ist Human-Review-ready","Release Candidate ist nicht approved","Release Candidate ist nicht ausgeführt","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase40:3:patch","phase40:3:verify","llm:provider-dispatch-release-candidate-envelope:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 40.3 Final Provider Dispatch Release Candidate Envelope Handoff ist vorbereitet.");

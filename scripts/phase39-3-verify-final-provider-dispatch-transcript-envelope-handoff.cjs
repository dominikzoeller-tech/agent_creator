const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 39.3 Final Provider Dispatch Transcript Envelope Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase39-3-final-provider-dispatch-transcript-envelope-handoff-release-summary.md",["Phase 39.3","Phase 40.0","providerDispatchTranscriptEnvelopePrepared=true","transcriptEnvelopePrepared=true","transcriptEnvelopePersisted=true","transcriptEnvelopeContainsProviderResponse=false","transcriptEnvelopeContainsPromptPayload=false","transcriptEnvelopeContainsSecrets=false","resultEnvelopeContainsProviderResponse=false","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","providerResponseIncluded=false","providerResultIncluded=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase39-final-provider-dispatch-transcript-envelope-handoff-runbook.md",["phase39:3:verify","llm:provider-dispatch-transcript-envelope:final:check","phase39:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase40.md",["Phase 40.0","Provider Dispatch Release Candidate Envelope","Transcript Envelope enthält keine Provider Response","Transcript Envelope enthält keinen Prompt Payload","Transcript Envelope enthält keine Secrets","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase39:3:patch","phase39:3:verify","llm:provider-dispatch-transcript-envelope:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 39.3 Final Provider Dispatch Transcript Envelope Handoff ist vorbereitet.");

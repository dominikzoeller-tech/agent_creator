const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 38.3 Final Provider Dispatch Dry-Run Result Envelope Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase38-3-final-provider-dispatch-dry-run-result-envelope-handoff-release-summary.md",["Phase 38.3","Phase 39.0","providerDispatchDryRunResultEnvelopePrepared=true","resultEnvelopePrepared=true","resultEnvelopePersisted=true","resultEnvelopeContainsProviderResponse=false","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","providerResponseIncluded=false","providerResultIncluded=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase38-final-provider-dispatch-dry-run-result-envelope-handoff-runbook.md",["phase38:3:verify","llm:provider-dispatch-dry-run-result-envelope:final:check","phase38:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase39.md",["Phase 39.0","Provider Dispatch Transcript Envelope","Dry-Run Result Envelope enthält keine Provider Response","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase38:3:patch","phase38:3:verify","llm:provider-dispatch-dry-run-result-envelope:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 38.3 Final Provider Dispatch Dry-Run Result Envelope Handoff ist vorbereitet.");

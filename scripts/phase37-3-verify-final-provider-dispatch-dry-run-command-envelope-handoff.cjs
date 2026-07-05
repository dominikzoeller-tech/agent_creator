const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 37.3 Final Provider Dispatch Dry-Run Command Envelope Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase37-3-final-provider-dispatch-dry-run-command-envelope-handoff-release-summary.md",["Phase 37.3","Phase 38.0","providerDispatchDryRunCommandEnvelopePrepared=true","commandEnvelopePrepared=true","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase37-final-provider-dispatch-dry-run-command-envelope-handoff-runbook.md",["phase37:3:verify","llm:provider-dispatch-dry-run-command-envelope:final:check","phase37:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase38.md",["Phase 38.0","Provider Dispatch Dry-Run Result Envelope","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase37:3:patch","phase37:3:verify","llm:provider-dispatch-dry-run-command-envelope:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 37.3 Final Provider Dispatch Dry-Run Command Envelope Handoff ist vorbereitet.");

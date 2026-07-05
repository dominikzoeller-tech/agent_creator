const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 36.3 Final Provider Dispatch Execution Gate Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase36-3-final-provider-dispatch-execution-gate-handoff-release-summary.md",["Phase 36.3","Phase 37.0","providerDispatchExecutionGatePrepared=true","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase36-final-provider-dispatch-execution-gate-handoff-runbook.md",["phase36:3:verify","llm:provider-dispatch-execution-gate:final:check","phase36:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase37.md",["Phase 37.0","Provider Dispatch Dry-Run Command Envelope","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase36:3:patch","phase36:3:verify","llm:provider-dispatch-execution-gate:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 36.3 Final Provider Dispatch Execution Gate Handoff ist vorbereitet.");

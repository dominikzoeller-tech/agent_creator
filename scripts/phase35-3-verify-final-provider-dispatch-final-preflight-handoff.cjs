const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 35.3 Final Provider Dispatch Final Preflight Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase35-3-final-provider-dispatch-final-preflight-handoff-release-summary.md",["Phase 35.3","Phase 36.0","providerDispatchFinalPreflightPrepared=true","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase35-final-provider-dispatch-final-preflight-handoff-runbook.md",["phase35:3:verify","llm:provider-dispatch-final-preflight:final:check","phase35:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase36.md",["Phase 36.0","Provider Dispatch Execution Gate","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase35:3:patch","phase35:3:verify","llm:provider-dispatch-final-preflight:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 35.3 Final Provider Dispatch Final Preflight Handoff ist vorbereitet.");

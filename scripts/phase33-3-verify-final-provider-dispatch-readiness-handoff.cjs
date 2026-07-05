const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 33.3 Final Provider Dispatch Readiness Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase33-3-final-provider-dispatch-readiness-handoff-release-summary.md",["Phase 33.3","Phase 34.0","providerDispatchPrepared=true","providerDispatchPerformed=false","metadataOnly=true","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase33-final-provider-dispatch-readiness-handoff-runbook.md",["phase33:3:verify","llm:provider-dispatch-readiness:final:check","phase33:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase34.md",["Phase 34.0","Provider Dispatch Token Binding","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase33:3:patch","phase33:3:verify","llm:provider-dispatch-readiness:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 33.3 Final Provider Dispatch Readiness Handoff ist vorbereitet.");

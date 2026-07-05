const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================");
console.log(" Phase 34.3 Final Provider Dispatch Token Binding Handoff Verify");
console.log("======================================");
let ok=true;
ok=check("phase34-3-final-provider-dispatch-token-binding-handoff-release-summary.md",["Phase 34.3","Phase 35.0","providerDispatchTokenBindingPrepared=true","tokenBoundToDispatch=false","tokenBindingActive=false","tokenActive=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase34-final-provider-dispatch-token-binding-handoff-runbook.md",["phase34:3:verify","llm:provider-dispatch-token-binding:final:check","phase34:2:smoke"])&&ok;
ok=check("next-chat-handoff-phase35.md",["Phase 35.0","Provider Dispatch Final Preflight","dryRunOnly=true","kein realer Provider Call"])&&ok;
ok=check("package.json",["phase34:3:patch","phase34:3:verify","llm:provider-dispatch-token-binding:final:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 34.3 Final Provider Dispatch Token Binding Handoff ist vorbereitet.");

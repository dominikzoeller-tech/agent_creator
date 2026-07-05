const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 36.0 Provider Dispatch Execution Gate Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-execution-gate-store.ts",["createProviderDispatchExecutionGate","controlled_provider_dispatch_execution_gate_no_provider_call","providerDispatchExecutionGatePrepared:true","executionGateOpen:false","finalDispatchAllowed:false","networkCallAllowed:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-execution-gate/route.ts",["createProviderDispatchExecutionGate","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-execution-gate/page.tsx",["Provider Dispatch Execution Gate","Provider Dispatch Execution Gate vorbereiten","providerDispatchExecutionGatePrepared","executionGateOpen","finalDispatchAllowed","networkCallAllowed","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-execution-gate","Dispatch Execution Gate","provider-dispatch-execution-gate"])&&ok;
ok=check("phase36-0-provider-dispatch-execution-gate.md",["Phase 36.0","Phase 36.1","providerDispatchExecutionGatePrepared=true","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase36-provider-dispatch-execution-gate-runbook.md",["phase36:0:patch","phase36:0:verify"])&&ok;
ok=check("package.json",["phase36:0:patch","phase36:0:verify","llm:provider-dispatch-execution-gate:verify"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 36.0 Provider Dispatch Execution Gate ist vorbereitet.");

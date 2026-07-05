const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/app/provider-dispatch-dry-run-command-envelope-dashboard/page.tsx",["Provider Dispatch Dry-Run Command Envelope Dashboard","Provider Dispatch Dry-Run Command Envelope Übersicht","providerDispatchDryRunCommandEnvelopePrepared=true","commandEnvelopePrepared=true","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-dry-run-command-envelope-dashboard","Dispatch Dry-Run Dashboard","provider-dispatch-dry-run-command-envelope-dashboard"])&&ok;
ok=check("scripts/phase37-2-provider-dispatch-dry-run-command-envelope-dashboard-smoke.cjs",["Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard Smoke","UI Provider Dispatch Dry-Run Command Envelope Dashboard","API Provider Dispatch Dry-Run Policy"])&&ok;
ok=check("phase37-2-provider-dispatch-dry-run-command-envelope-dashboard-smoke.md",["Phase 37.2","Phase 37.3","Provider Dispatch Dry-Run Command Envelope Dashboard","providerDispatchDryRunCommandEnvelopePrepared=true","commandEnvelopePrepared=true","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase37-provider-dispatch-dry-run-command-envelope-dashboard-smoke-runbook.md",["phase37:2:patch","phase37:2:verify","phase37:2:smoke"])&&ok;
ok=check("package.json",["phase37:2:patch","phase37:2:verify","phase37:2:smoke","llm:provider-dispatch-dry-run-command-envelope:release:check"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 37.2 Provider Dispatch Dry-Run Command Envelope Dashboard & Smoke ist vorbereitet.");

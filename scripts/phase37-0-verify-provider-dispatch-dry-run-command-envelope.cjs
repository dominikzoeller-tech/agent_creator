const fs=require("fs"); const path=require("path");
function full(f){return path.join(process.cwd(),f)} function exists(f){return fs.existsSync(full(f))} function read(f){return exists(f)?fs.readFileSync(full(f),"utf8"):""}
function check(f, patterns){ if(!exists(f)){ console.log("MISS "+f); return false; } const c=read(f); let ok=true; for(const p of patterns){ const found=c.includes(p); console.log((found?"OK  ":"MISS")+" "+f+": "+p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 37.0 Provider Dispatch Dry-Run Command Envelope Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/provider-dispatch-dry-run-command-envelope-store.ts",["createProviderDispatchDryRunCommandEnvelope","controlled_provider_dispatch_dry_run_command_envelope_no_provider_call","providerDispatchDryRunCommandEnvelopePrepared:true","commandEnvelopePrepared:true","commandEnvelopeExecuted:false","executionGateOpen:false","finalDispatchAllowed:false","networkCallAllowed:false","networkCallPerformed:false","providerExecutionAllowed:false","llmCallPerformed:false"])&&ok;
ok=check("frontend/app/api/provider-dispatch-dry-run-command-envelope/route.ts",["createProviderDispatchDryRunCommandEnvelope","GET","POST"])&&ok;
ok=check("frontend/app/provider-dispatch-dry-run-command-envelope/page.tsx",["Provider Dispatch Dry-Run Command Envelope","Provider Dispatch Dry-Run Command Envelope vorbereiten","providerDispatchDryRunCommandEnvelopePrepared","commandEnvelopePrepared","commandEnvelopeExecuted","executionGateOpen","finalDispatchAllowed","networkCallAllowed","networkCallPerformed"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/provider-dispatch-dry-run-command-envelope","Dispatch Dry-Run Command","provider-dispatch-dry-run-command-envelope"])&&ok;
ok=check("phase37-0-provider-dispatch-dry-run-command-envelope.md",["Phase 37.0","Phase 37.1","providerDispatchDryRunCommandEnvelopePrepared=true","commandEnvelopePrepared=true","commandEnvelopeExecuted=false","executionGateOpen=false","finalDispatchAllowed=false","networkCallAllowed=false","networkCallPerformed=false","providerExecutionAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase37-provider-dispatch-dry-run-command-envelope-runbook.md",["phase37:0:patch","phase37:0:verify"])&&ok;
ok=check("package.json",["phase37:0:patch","phase37:0:verify","llm:provider-dispatch-dry-run-command-envelope:verify"])&&ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 37.0 Provider Dispatch Dry-Run Command Envelope ist vorbereitet.");

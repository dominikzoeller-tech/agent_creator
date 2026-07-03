const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 21.0 Approved Invocation Envelope Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approved-real-llm-invocation-envelope-store.ts",["createApprovedRealLlmInvocationEnvelope","approved_invocation_envelope_prep_only","realLlmCallAllowed:false","llmCallPerformed:false","executionAllowed:false","toolExecutionAllowed:false","agentExecutionAllowed:false"])&&ok;
ok=check("frontend/app/api/approved-real-llm-invocation-envelope/route.ts",["createApprovedRealLlmInvocationEnvelope","GET","POST"])&&ok;
ok=check("frontend/app/approved-real-llm-invocation-envelope/page.tsx",["Approved Real LLM Invocation Envelope","Approved Invocation Envelope vorbereiten","realLlmCallAllowed","humanApprovalRequired"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approved-real-llm-invocation-envelope","Invocation Envelope","approved-real-llm-invocation-envelope"])&&ok;
ok=check("phase21-0-approved-real-llm-invocation-envelope.md",["Phase 21.0","Approved Real LLM Invocation Envelope","Phase 21.1","realLlmCallAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase21-approved-real-llm-invocation-envelope-runbook.md",["phase21:0:patch","phase21:0:verify","/approved-real-llm-invocation-envelope"])&&ok;
ok=check("package.json",["phase21:0:patch","phase21:0:verify","llm:approved-envelope:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 21.0 Approved Real LLM Invocation Envelope ist vorbereitet.");

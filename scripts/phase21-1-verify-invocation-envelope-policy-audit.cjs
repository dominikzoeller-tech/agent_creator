const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 21.1 Invocation Envelope Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/approved-real-llm-invocation-envelope-policy-store.ts",["simulateInvocationEnvelopePolicy","appendGovernanceAuditEvent","simulation_allowed_envelope_only","realLlmCallAllowed:false","llmCallPerformed:false","executionAllowed:false"])&&ok;
ok=check("frontend/app/api/approved-real-llm-invocation-envelope-policy/route.ts",["simulateInvocationEnvelopePolicy","GET","POST"])&&ok;
ok=check("frontend/app/approved-real-llm-invocation-envelope-policy/page.tsx",["Invocation Envelope Policy","Invocation Envelope Policy simulieren","realLlmCallAllowed","humanApprovalRequired"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/approved-real-llm-invocation-envelope-policy","Envelope Policy","approved-real-llm-invocation-envelope-policy"])&&ok;
ok=check("phase21-1-invocation-envelope-policy-simulation-audit.md",["Phase 21.1","Invocation Envelope Policy Simulation","Phase 21.2","realLlmCallAllowed=false","dryRunOnly=true"])&&ok;
ok=check("docs/phase21-invocation-envelope-policy-simulation-audit-runbook.md",["phase21:1:patch","phase21:1:verify"])&&ok;
ok=check("package.json",["phase21:1:patch","phase21:1:verify","llm:approved-envelope:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 21.1 Invocation Envelope Policy Simulation & Audit ist vorbereitet.");

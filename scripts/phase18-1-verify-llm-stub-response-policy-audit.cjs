const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 18.1 Stub Response Policy Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/controlled-llm-stub-policy-store.ts",["simulateControlledLlmStubPolicy","appendGovernanceAuditEvent","llmCallPerformed:false","stubOnly:true","executionAllowed:false"])&&ok;
ok=check("frontend/app/api/llm-stub-policy/route.ts",["simulateControlledLlmStubPolicy","GET","POST"])&&ok;
ok=check("frontend/app/llm-stub-policy/page.tsx",["LLM Stub Policy","Stub Response Policy simulieren","llmCallPerformed","stubOnly"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/llm-stub-policy","Stub Policy","llm-stub-policy"])&&ok;
ok=check("phase18-1-stub-response-policy-simulation-audit.md",["Phase 18.1","Stub Response Policy Simulation","Phase 18.2","llmCallPerformed=false","stubOnly=true"])&&ok;
ok=check("docs/phase18-stub-response-policy-simulation-audit-runbook.md",["phase18:1:patch","phase18:1:verify"])&&ok;
ok=check("package.json",["phase18:1:patch","phase18:1:verify","llm:stub:policy:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 18.1 Stub Response Policy Simulation & Audit ist vorbereitet.");

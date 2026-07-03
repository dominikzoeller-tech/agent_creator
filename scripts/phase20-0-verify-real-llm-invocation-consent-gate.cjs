const fs=require("fs"); const path=require("path");
function full(file){return path.join(process.cwd(),file);} function exists(file){return fs.existsSync(full(file));} function read(file){return exists(file)?fs.readFileSync(full(file),"utf8"):"";}
function check(file,patterns){ if(!exists(file)){console.log("MISS "+file); return false;} const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS")+" "+file+": "+p); if(!found) ok=false;} return ok; }
console.log("======================================"); console.log(" Phase 20.0 Real LLM Invocation Consent Verify"); console.log("======================================");
let ok=true;
ok=check("frontend/lib/real-llm-invocation-consent-store.ts",["createRealLlmInvocationConsentRequest","consentRequired:true","humanApprovalRequired:true","realLlmCallAllowed:false","llmCallPerformed:false","executionAllowed:false"])&&ok;
ok=check("frontend/app/api/real-llm-consent/route.ts",["createRealLlmInvocationConsentRequest","GET","POST"])&&ok;
ok=check("frontend/app/real-llm-consent/page.tsx",["Real LLM Invocation Consent","Real LLM Consent Request vorbereiten","humanApprovalRequired","consentRequired"])&&ok;
ok=check("frontend/components/UnifiedNavigation.tsx",["/real-llm-consent","Real LLM Consent","real-llm-consent"])&&ok;
ok=check("phase20-0-real-llm-invocation-consent-gate.md",["Phase 20.0","Real LLM Invocation Consent Gate","Phase 20.1","humanApprovalRequired=true","consentRequired=true"])&&ok;
ok=check("docs/phase20-real-llm-invocation-consent-gate-runbook.md",["phase20:0:patch","phase20:0:verify","/real-llm-consent"])&&ok;
ok=check("package.json",["phase20:0:patch","phase20:0:verify","llm:real-consent:verify"])&&ok;
if(!ok){console.error("Verify fehlgeschlagen."); process.exit(1);} console.log("Verify OK. Phase 20.0 Real LLM Invocation Consent Gate ist vorbereitet.");

const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log(`MISS ${file}`); return false; }
  const content = read(file); let ok = true;
  for(const pattern of patterns){ const found = content.includes(pattern); console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`); if(!found) ok = false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 11.3 Consent Resume Verify");
console.log("======================================");
let ok = true;
ok = check("tool-consent-agent-flow.ts", ["getAgentFlowToolConsentRequest", "isAgentFlowToolConsentApproved", "expired", "approved"]) && ok;
ok = check("server.ts", ["consentRequestId?: string", "getAgentFlowToolConsentRequest", "PHASE 11.3: Approved Consent Resume Gate", "approvedToolConsent", "agent-flow-resume"]) && ok;
ok = check("frontend/components/AgentFlowConsentRequestPanel.tsx", ["Phase 11.3 Resume", "Consent Request ID"]) && ok;
ok = check("phase11-3-consent-resume-approved-tool-execution.md", ["Phase 11.3", "approved", "pending/denied/expired/missing"]) && ok;
ok = check("docs/phase11-consent-resume-approved-tool-execution-runbook.md", ["phase11:3:patch", "phase11:3:verify", "consentRequestId"]) && ok;
ok = check("scripts/phase11-3-patch-consent-resume-approved-execution.cjs", ["Phase 11.3", "Approved Consent Resume Gate"]) && ok;
ok = check("scripts/phase11-3-verify-consent-resume-approved-execution.cjs", ["Phase 11.3 Consent Resume Verify"]) && ok;
ok = check("package.json", ["phase11:3:patch", "phase11:3:verify", "tools:consent:resume:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.3 Consent Resume / Approved Tool Execution ist vorbereitet.");

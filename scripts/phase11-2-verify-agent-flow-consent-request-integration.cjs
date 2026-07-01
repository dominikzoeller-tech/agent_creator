const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log(`MISS ${file}`); return false; }
  const content=read(file); let ok=true;
  for(const p of patterns){ const found=content.includes(p); console.log(`${found?"OK  ":"MISS"} ${file}: ${p}`); if(!found) ok=false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 11.2 Agent Flow Consent Verify");
console.log("======================================");
let ok=true;
ok = check("phase11-2-agent-flow-consent-request-integration.md", ["Phase 11.2", "consentRequestId", "Resume nach Approval"]) && ok;
ok = check("docs/phase11-agent-flow-consent-request-integration-runbook.md", ["npm run phase11:2:patch", "npm run phase11:2:verify", "/tool-consent?requestId="]) && ok;
ok = check("scripts/phase11-2-patch-agent-flow-consent-request-integration.cjs", ["PHASE 11.2", "Agent Flow Consent Request Gate", "consentRequestId"]) && ok;
ok = check("scripts/phase11-2-verify-agent-flow-consent-request-integration.cjs", ["Phase 11.2 Agent Flow Consent Verify", "hardBlocked", "res.json"]) && ok;
ok = check("tool-consent-agent-flow.ts", ["createAgentFlowToolConsentRequest", "agent-flow", "tool-consent-requests.json", "pending"]) && ok;
ok = check("server.ts", ["createAgentFlowToolConsentRequest", "PHASE 11.2: Agent Flow Consent Request Gate", "consentRequired", "consentRequestId", "consentUrl", "/tool-consent?requestId=", "hardBlocked"]) && ok;
ok = check("frontend/components/AgentFlowConsentRequestPanel.tsx", ["AgentFlowConsentRequestPanel", "Consent Request im Agent Flow", "consentRequestId"]) && ok;
ok = check("frontend/app/page.tsx", ["AgentFlowConsentRequestPanel", "<AgentFlowConsentRequestPanel response={response} />"]) && ok;
ok = check("frontend/lib/tool-consent-store.ts", ["createToolConsentRequest", "pending", "approved", "denied", "expired"]) && ok;
ok = check("frontend/app/api/tool-consent/route.ts", ["createToolConsentRequest", "decideToolConsentRequest", "listToolConsentRequests"]) && ok;
ok = check("frontend/app/tool-consent/page.tsx", ["Tool Consent", "pending", "approved", "denied"]) && ok;
ok = check("package.json", ["phase11:2:patch", "phase11:2:verify", "tools:consent:flow:verify"]) && ok;
const server = read("server.ts");
const badResJson = /res\.json\s*\(/.test(server);
console.log(`${badResJson ? "WARN" : "OK  "} server.ts: kein neu eingeführtes res.json im ServerResponse-Flow`);
const analytics = read("frontend/app/api/analytics/route.ts");
if(analytics){
  const directRisk = analytics.includes("entry.toolEnforcement") && !analytics.includes("DecisionLogEntryWithToolEnforcement");
  console.log(`${directRisk ? "WARN" : "OK  "} analytics route: DecisionLogEntry toolEnforcement Cast wirkt robust`);
}
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.2 Agent Flow Consent Request Integration ist vorhanden.");

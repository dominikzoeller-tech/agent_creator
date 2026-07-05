const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!fs.existsSync(full(file))){ console.log("MISS " + file); return false; }
  const content = read(file); let ok=true;
  for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 46.1a Ledger Policy Audit Event Type Verify");
console.log("======================================");
let ok=true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts", [
  "appendGovernanceAuditEvent({",
  "type: \"agent_registry_status_changed\"",
  "actor: \"api\"",
  "entityType: \"agent-registry\"",
  "status: sim.decision",
  "riskLevel: \"critical\"",
  "phase46.1-provider-dispatch-human-approval-token-issuance-ledger-policy",
  "providerExecutionAllowed: false",
  "dryRunOnly: true"
]) && ok;
const content = read("frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts");
if(content.includes("provider_dispatch_human_approval_token_issuance_ledger_policy_simulated")){
  console.log("MISS frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts: invalid custom GovernanceAuditEventType still present");
  ok=false;
}
ok = check("package.json", ["phase46:1a:hotfix", "phase46:1a:verify"]) && ok;
if(!ok){ console.error("Hotfix Verify fehlgeschlagen."); process.exit(1); }
console.log("Hotfix Verify OK. Ledger Policy Audit Event Type ist kompatibel.");

const fs = require("fs");
const path = require("path");
function read(file) { try { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); } catch { return ""; } }
function check(file, patterns) {
  const content = read(file);
  if (!content) { console.log("MISS " + file); return false; }
  let ok = true;
  for (const p of patterns) {
    const found = content.includes(p);
    console.log((found ? "OK  " : "MISS") + " " + file + ": " + p);
    if (!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 46.1 Issuance Ledger Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts", [
  "simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy",
  "human_approval_token_issuance_ledger_policy_review_only",
  "networkCallPerformed: false",
  "providerExecutionAllowed: false",
  "humanApprovalTokenIssued: false",
  "dryRunOnly: true",
]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-ledger-policy/route.ts", ["GET", "POST", "simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-ledger-policy/page.tsx", [
  "Provider Dispatch Human Approval Token Issuance Ledger Policy",
  "Issuance Ledger Policy simulieren",
  "humanApprovalTokenIssued=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-human-approval-token-issuance-ledger-policy",
  "Issuance Ledger Policy",
  "provider-dispatch-human-approval-token-issuance-ledger-policy",
]) && ok;
ok = check("phase46-1-provider-dispatch-human-approval-token-issuance-ledger-policy-audit.md", [
  "Phase 46.1",
  "Phase 46.2",
  "humanApprovalTokenIssued=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
]) && ok;
ok = check("package.json", ["phase46:1:patch", "phase46:1:verify", "llm:provider-dispatch-human-approval-token-issuance-ledger:policy:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 46.1 ist vorbereitet.");

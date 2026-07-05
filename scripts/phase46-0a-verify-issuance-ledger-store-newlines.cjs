const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!fs.existsSync(full(file))){ console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; }
  return ok;
}
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-store.ts", [
  ".split(\"\\n\")",
  "appendFileSync(ledgerPath(), JSON.stringify(entry) + \"\\n\", \"utf8\")",
  "containsSecretValue",
  "providerDispatchHumanApprovalTokenIssuanceLedgerRecorded: true",
  "humanApprovalTokenIssuanceLedgerEntryPrepared: true",
  "humanApprovalTokenIssued: false",
  "networkCallPerformed: false",
  "providerExecutionAllowed: false",
  "dryRunOnly: true"
]) && ok;
if(!ok){ console.error("Hotfix Verify fehlgeschlagen."); process.exit(1); }
console.log("Hotfix Verify OK. Ledger Store ist syntaktisch repariert.");

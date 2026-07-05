const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content = read(file); let ok = true; for(const p of patterns){ const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if(!found) ok = false; } return ok; }
console.log("======================================");
console.log(" Phase 47.1 Human Approval Token Issuance Receipt Policy Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/provider-dispatch-human-approval-token-issuance-receipt-policy-store.ts", ["simulateProviderDispatchHumanApprovalTokenIssuanceReceiptPolicy", "human_approval_token_issuance_receipt_policy_audit_only", "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded: true", "humanApprovalTokenIssuanceReceiptPrepared: true", "humanApprovalTokenIssued: false", "humanApprovalTokenActivated: false", "humanApprovalTokenConsumed: false", "networkCallPerformed: false", "providerExecutionAllowed: false", "llmCallPerformed: false", "dryRunOnly: true", ".split(\"\\n\")", "JSON.stringify(simulation) + \"\\n\""]) && ok;
ok = check("frontend/app/api/provider-dispatch-human-approval-token-issuance-receipt-policy/route.ts", ["simulateProviderDispatchHumanApprovalTokenIssuanceReceiptPolicy", "GET", "POST"]) && ok;
ok = check("frontend/app/provider-dispatch-human-approval-token-issuance-receipt-policy/page.tsx", ["Provider Dispatch Human Approval Token Issuance Receipt Policy", "Receipt Policy simulieren", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-human-approval-token-issuance-receipt-policy", "Token Issuance Receipt Policy", "provider-dispatch-human-approval-token-issuance-receipt-policy"]) && ok;
ok = check("phase47-1-provider-dispatch-human-approval-token-issuance-receipt-policy-audit.md", ["Phase 47.1", "Phase 47.2", "providerDispatchHumanApprovalTokenIssuanceReceiptRecorded=true", "humanApprovalTokenIssued=false", "humanApprovalTokenActivated=false", "humanApprovalTokenConsumed=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase47-provider-dispatch-human-approval-token-issuance-receipt-policy-audit-runbook.md", ["phase47:1:patch", "phase47:1:verify"]) && ok;
ok = check("package.json", ["phase47:1:patch", "phase47:1:verify", "llm:provider-dispatch-human-approval-token-issuance-receipt:policy:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 47.1 Provider Dispatch Human Approval Token Issuance Receipt Policy & Audit ist vorbereitet.");

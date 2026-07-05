const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.existsSync(full(file)) ? fs.readFileSync(full(file), "utf8") : ""; }
function write(file, content){ fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), content, "utf8"); console.log("OK " + file); }

const file = "frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store.ts";
let content = read(file);
if (!content) {
  console.error("Missing " + file);
  process.exit(1);
}

const badBlock = `  appendGovernanceAuditEvent({
    id: sim.id,
    createdAt: now,
    type: "provider_dispatch_human_approval_token_issuance_ledger_policy_simulated",
    summary: "Provider dispatch human approval token issuance ledger policy simulated without token issuance or provider call.",
    metadata: sim,
  });`;
const goodBlock = `  appendGovernanceAuditEvent({
    type: "agent_registry_status_changed",
    actor: "api",
    entityType: "agent-registry",
    entityId: sim.sourceLedgerEntryId,
    status: sim.decision,
    riskLevel: "critical",
    summary: "Provider dispatch human approval token issuance ledger policy simulated without token issuance or provider call.",
    metadata: {
      source: "phase46.1-provider-dispatch-human-approval-token-issuance-ledger-policy",
      simulationId: sim.id,
      sourceLedgerEntryId: sim.sourceLedgerEntryId,
      humanApprovalTokenIssued: false,
      humanApprovalTokenActivated: false,
      humanApprovalTokenConsumed: false,
      networkCallPerformed: false,
      providerExecutionAllowed: false,
      llmCallPerformed: false,
      dryRunOnly: true
    }
  });`;

if (content.includes(badBlock)) {
  content = content.replace(badBlock, goodBlock);
} else if (content.includes('type: "provider_dispatch_human_approval_token_issuance_ledger_policy_simulated"')) {
  content = content.replace('type: "provider_dispatch_human_approval_token_issuance_ledger_policy_simulated"', 'type: "agent_registry_status_changed"');
  content = content.replace('id: sim.id,\n    createdAt: now,\n    type: "agent_registry_status_changed",', 'type: "agent_registry_status_changed",\n    actor: "api",\n    entityType: "agent-registry",\n    entityId: sim.sourceLedgerEntryId,\n    status: sim.decision,\n    riskLevel: "critical",');
} else {
  console.log("No invalid audit type found; keeping file unchanged.");
}
write(file, content);

const pkgFile = "package.json";
const pkg = JSON.parse(read(pkgFile));
pkg.scripts = pkg.scripts || {};
pkg.scripts["phase46:1a:hotfix"] = "node scripts/phase46-1a-hotfix-ledger-policy-audit-event-type.cjs";
pkg.scripts["phase46:1a:verify"] = "node scripts/phase46-1a-verify-ledger-policy-audit-event-type.cjs";
write(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
console.log("Phase 46.1a Hotfix abgeschlossen.");

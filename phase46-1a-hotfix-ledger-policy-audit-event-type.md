# Phase 46.1a Hotfix – Ledger Policy Audit Event Type

Fixes TypeScript build error:

```text
Type '"provider_dispatch_human_approval_token_issuance_ledger_policy_simulated"' is not assignable to type 'GovernanceAuditEventType'.
```

Run:

```powershell
node scripts/phase46-1a-hotfix-ledger-policy-audit-event-type.cjs
node scripts/phase46-1a-verify-ledger-policy-audit-event-type.cjs
npm run phase46:1:verify
npm run build
```

Then rebuild Docker:

```powershell
docker compose -f docker-compose.internal.yml down
docker compose -f docker-compose.internal.yml up --build -d
npm run stack:health
```

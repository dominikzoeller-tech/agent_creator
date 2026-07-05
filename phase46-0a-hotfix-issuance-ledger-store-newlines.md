# Phase 46.0a Hotfix – Issuance Ledger Store Newlines

Fixes malformed generated newline literals in:

```text
frontend/lib/provider-dispatch-human-approval-token-issuance-ledger-store.ts
```

Run:

```powershell
node scripts/phase46-0a-hotfix-issuance-ledger-store-newlines.cjs
node scripts/phase46-0a-verify-issuance-ledger-store-newlines.cjs
npm run phase46:0:verify
npm run build
```

Then rebuild Docker:

```powershell
docker compose -f docker-compose.internal.yml down
docker compose -f docker-compose.internal.yml up --build -d
npm run stack:health
```

# Phase 48.2a Hotfix

Fix for missing acknowledgement policy audit store import.

Run:
```powershell
node scripts/phase48-2a-hotfix-missing-acknowledgement-policy-audit-store.cjs
npm run phase48:2a:verify
npm run build
```

Then continue:
```powershell
npm run phase48:3:verify
npm run llm:provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit:final:check
npm run build
```

Commit after green:
```powershell
git status --short
git add .
git commit -m "fix: add missing provider dispatch acknowledgement policy audit store"
git push origin main
git status --short
```

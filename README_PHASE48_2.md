# Phase 48.2

Run:
```powershell
node scripts/phase48-2-patch-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-policy-audit-dashboard-smoke.cjs
npm run phase48:2:verify
npm run build
```

Optional Smoke, nur wenn Stack laeuft:
```powershell
npm run phase48:2:smoke
```

Commit:
```powershell
git status --short
git add .
git commit -m "feat: add provider dispatch human approval token issuance receipt acknowledgement policy audit dashboard"
git push origin main
git status --short
```

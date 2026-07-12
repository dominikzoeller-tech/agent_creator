# Phase 50.2

Run:
```powershell
node scripts/phase50-2-patch-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-policy-audit-dashboard-smoke.cjs
npm run phase50:2:verify
npm run build
```

Optional Smoke, nur wenn Stack neu läuft:
```powershell
npm run phase50:2:smoke
```

Commit:
```powershell
git status --short
git add .
git commit -m "feat: add provider dispatch acknowledgement completion receipt policy audit dashboard"
git push origin main
git status --short
```

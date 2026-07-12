# Phase 74.2

Run:
```powershell
node scripts/phase74-2-patch-provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-receipt-policy-audit-dashboard-smoke.cjs
npm run phase74:2:verify
npm run build
```

Optional Smoke, nur wenn Stack neu läuft. Hinweis: localhost:7071/health braucht den separaten Backend-Health-Prozess:
```powershell
npm run phase74:2:smoke
```

Commit:
```powershell
git status --short
git add .
git commit -m "feat: add provider dispatch acknowledgement completion receipt closure finalization archive completion final closure receipt policy audit dashboard"
git push origin main
git status --short
```

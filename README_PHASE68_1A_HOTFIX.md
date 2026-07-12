# Phase 68.1a Hotfix

Fixes broken newline escaping in the Phase 68.1 patch script and immediately applies Phase 68.1.

Run:
```powershell
node scripts/phase68-1a-hotfix-rewrite-phase68-1-patch.cjs
npm run phase68:1:verify
npm run phase68:2:verify
npm run build
```

Then restart frontend and smoke:
```powershell
npm run dev
npm run phase68:2:smoke
```

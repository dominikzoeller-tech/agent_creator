# Phase 49.0a Hotfix

Fixes module resolution by replacing new `@/lib/...acknowledgement...` imports with relative imports and re-writing both required store files.

Run:
```powershell
node scripts/phase49-0a-hotfix-relative-imports-for-acknowledgement-boundary-stores.cjs
npm run phase49:0a:verify
npm run build
```

Commit if green:
```powershell
git status --short
git add .
git commit -m "fix: resolve acknowledgement boundary store imports"
git push origin main
git status --short
```

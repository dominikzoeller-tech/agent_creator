# Phase 40.2b Hotfix

Entpacke diese ZIP in das Projektroot `C:\Users\User\ai-assistant\agent_creator`.

Dann ausführen:

```powershell
node scripts/phase40-2b-hotfix-build-breakers.cjs
npm run phase40:2:verify
npm run build
```

Wenn grün:

```powershell
npm run stack:up:detached
npm run stack:health
npm run phase40:2:smoke
```

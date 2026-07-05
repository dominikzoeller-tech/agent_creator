# Phase 41.2a Rescue Apply Dashboard Patch

Entpacke diese ZIP in das Projektroot und führe aus:

```powershell
cd C:\Users\User\ai-assistant\agent_creator
node scripts/phase41-2a-rescue-apply-dashboard-patch.cjs
npm run phase41:2:verify
npm run build
npm run stack:health
npm run phase41:2:smoke
```

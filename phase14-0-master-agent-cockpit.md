# Phase 14.0 – Master Agent Cockpit / Unified Control Center Foundation

Dieses Paket enthält Patch-, Verify- und Smoke-Script für Phase 14.0.

Ausführen im Projektroot:

```powershell
node scripts/phase14-0-patch-master-agent-cockpit.cjs
npm run phase14:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
npm run phase14:0:smoke
```

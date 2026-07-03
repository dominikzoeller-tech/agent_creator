# Phase 13.0 – Controlled Tool Execution Sandbox / Tool Adapter Registry Foundation

Dieses Paket enthält Patch- und Verify-Script für Phase 13.0.

Ausführen im Projektroot:

```powershell
node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs
npm run phase13:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

Verify-Hinweis: toolExecutionAllowed bleibt immer false und dryRunOnly bleibt immer true.


N�chster Schritt: Phase 13.1 � Tool Adapter Consent Binding.


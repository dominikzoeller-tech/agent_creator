# Phase 11.6 – Controlled Agent Registry Activation

Dieses Paket enthält Patch- und Verify-Script für Phase 11.6.

Ausführen im Projektroot:

```powershell
node scripts/phase11-6-patch-controlled-agent-registry-activation.cjs
npm run phase11:6:verify
npm run build
npm run stack:health
```

Verify-Hinweis: Neue Registry Entries starten im Status test_mode.


Verify-Hinweis: Es erfolgt keine automatische Code-Erzeugung und keine freie Agent-Ausf�hrung.


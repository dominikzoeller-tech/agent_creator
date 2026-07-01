# Phase 11.2 – Agent Flow Consent Request Integration

Dieses Paket enthält Patch- und Verify-Script für Phase 11.2. Bitte im Projektroot entpacken und anschließend ausführen:

```powershell
npm run phase11:2:patch
npm run phase11:2:verify
npm run tools:consent:verify
```

Danach Build/Health prüfen.

Verify-Hinweis: Die Response enth�lt consentRequestId und consentUrl. Resume nach Approval kommt in Phase 11.3.


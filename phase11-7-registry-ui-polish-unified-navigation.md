# Phase 11.7 – Registry UI Polish & Unified Navigation

Dieses Paket enthält Patch- und Verify-Script für Phase 11.7.

Ausführen im Projektroot:

```powershell
node scripts/phase11-7-patch-registry-ui-polish-unified-navigation.cjs
npm run phase11:7:verify
npm run build
npm run stack:health
```

Verify-Hinweis: Die zentrale Komponente heißt UnifiedNavigation.
Verify-Hinweis: data/ wird als Runtime Store ignoriert.

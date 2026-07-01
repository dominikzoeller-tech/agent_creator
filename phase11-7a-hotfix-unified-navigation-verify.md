# Phase 11.7a – Unified Navigation Verify Hotfix

Dieser Hotfix behebt reine Verify-Restpunkte aus Phase 11.7:

- `frontend/app/tool-consent/page.tsx` erhält exakt `<UnifiedNavigation active="tool-consent" />`.
- `phase11-7-registry-ui-polish-unified-navigation.md` erhält die Verify-Begriffe `UnifiedNavigation` und `data/`.

Ausführen:

```powershell
node scripts/phase11-7a-hotfix-unified-navigation-verify.cjs
npm run phase11:7a:verify
npm run phase11:7:verify
npm run build
npm run stack:health
```

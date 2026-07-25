# build-stabilize-legacy-cmt

Ziel: Nicht mehr jeden einzelnen Legacy-CMT-Buildfehler separat jagen.

Dieser Patch stabilisiert alte CMT-Kompatibilitaetsmodule zentral.

Was passiert:

- scannt `frontend/app/**/*.ts(x)` nach relativen Imports auf `lib/cmt-*` und `lib/cmt-secure-*`
- erstellt fehlende Zielmodule exakt an dem Pfad, den TypeScript/Next erwartet
- ergaenzt fehlende Named-Exports automatisch
- unterscheidet grob zwischen Value-Exports und Type-Exports
- setzt breite Legacy-Typen wie `SecureMasterCommitteeResult` als `any`
- repariert gemischte `PrivacyDecisionOption`-Import-Konflikte erneut
- typisiert einfache `.map(...)` Parameter defensiv

Ausfuehren:

```powershell
node .\build-stabilize-legacy-cmt\scripts\build-stabilize-legacy-cmt.cjs
npm run legacystable:verify
npm run build
```

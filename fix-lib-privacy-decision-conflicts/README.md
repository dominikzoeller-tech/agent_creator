# fix-lib-privacy-decision-conflicts

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Import declaration conflicts with local declaration of 'PrivacyDecisionOption'
```

Jetzt tritt der Konflikt nicht in `frontend/app`, sondern in `frontend/lib` auf, z. B.:

```text
frontend/lib/cmt-master-answer-log-list-filter-options.ts
```

Dieser Patch scannt `frontend/lib/**/*.ts(x)` und entfernt `PrivacyDecisionOption` aus Type-Imports von `cmt-privacy-decision`, wenn die Datei bereits lokal `type PrivacyDecisionOption = ...` definiert.

Andere Type-Imports bleiben erhalten.

Ausfuehren:

```powershell
node .\fix-lib-privacy-decision-conflicts\scripts\fix-lib-privacy-decision-conflicts.cjs
npm run fixlibprivacy:verify
npm run build
```

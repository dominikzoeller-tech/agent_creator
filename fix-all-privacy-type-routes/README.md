# fix-all-privacy-type-routes

Fix fuer wiederkehrenden TypeScript-Fehler in API-Routen:

```text
PrivacyDecisionOption refers to a value, but is being used as a type here.
```

Dieser Patch scannt alle Dateien unter:

```text
frontend/app/**/*.ts
frontend/app/**/*.tsx
```

und ersetzt problematische externe Type-Imports von `PrivacyDecisionOption` durch einen lokalen Union-Type in der jeweiligen Datei.

Ausfuehren:

```powershell
node .\fix-all-privacy-type-routes\scripts\fix-all-privacy-type-routes.cjs
npm run fixprivacyroutes:verify
npm run build
```

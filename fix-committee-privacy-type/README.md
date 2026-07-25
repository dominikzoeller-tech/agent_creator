# fix-committee-privacy-type

Fix fuer aktuellen TypeScript-Fehler:

```text
PrivacyDecisionOption refers to a value, but is being used as a type here.
```

Der Fix entfernt den problematischen externen Type-Import in:

```text
frontend/app/api/cmt/master/secure/committee/route.ts
```

und definiert den kleinen Union-Type lokal in der Route.

Ausfuehren:

```powershell
node .\fix-committee-privacy-type\scripts\fix-committee-privacy-type.cjs
npm run fixcommitteeprivacy:verify
npm run build
```

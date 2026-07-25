# fix-privacy-gate-regex

Fix fuer aktuellen Build-Fehler in:

```text
frontend/lib/cmt-privacy-gate.ts
```

Problem:

Die Regex-Literale wurden durch vorherige Patch-Skripte kaputt geschrieben, z. B.:

```ts
/+?[0-9][0-9s().-]{6,}/g
/(Kunde|Firma|Projekt|Angebot|Kalkulation)s+[^,.
]+/gi
```

Dieser Patch schreibt die Datei bewusst ohne Regex-Literale neu und nutzt `new RegExp(...)`, damit keine Escape-Zeichen beim Patchen verloren gehen.

Ausfuehren:

```powershell
node .\fix-privacy-gate-regex\scripts\fix-privacy-gate-regex.cjs
npm run fixprivacy:verify
npm run build
```

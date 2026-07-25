# fix-build-final-syntax

Gezielter Build-Fix fuer die aktuellen Fehler:

- doppelte Export-Identifier in generierten Kompatibilitaets-Stubs
- kaputte `.join('\n')` / `.split('\n')` Literale auch unter `frontend/lib`
- defekte Regex in `frontend/lib/cmt-privacy-gate.ts`
- fehlendes `frontend/lib/cmt-master-answer-log-status.ts`

Ausfuehren:

```powershell
node .\fix-build-final-syntax\scripts\fix-build-final-syntax.cjs
npm run fixfinal:verify
npm run build
```

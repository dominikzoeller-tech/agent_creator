# fix-current-build-errors

Gezielter Fix fuer die aktuell sichtbaren Build-Fehler:

- doppelte Exports in `frontend/app/lib/cmt-master-app-entry.ts`
- doppelte Exports in `frontend/app/lib/cmt-master-nav-status.ts`
- kaputtes `bullets.join('\n')` in `frontend/lib/cmt-demo-share.ts`
- fehlendes `frontend/lib/cmt-master-answer-log-status.ts`
- kaputte Regex in `frontend/lib/cmt-privacy-gate.ts`

Dieser Patch schreibt die problematischen Dateien bewusst robust neu bzw. repariert kaputte `.split()`/`.join()` Newline-Literale in `frontend/app` und `frontend/lib`.

Ausfuehren:

```powershell
node .\fix-current-build-errors\scripts\fix-current-build-errors.cjs
npm run fixcurrent:verify
npm run build
```

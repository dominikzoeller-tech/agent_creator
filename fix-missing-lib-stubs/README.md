# fix-missing-lib-stubs

Fix fuer aktuelle Build-Fehler:

```text
Module not found: Can't resolve ...lib/cmt-master-...
```

Dieser Patch erstellt fehlende `frontend/lib/*.ts` Module als robuste Kompatibilitaets-Stubs, damit alte/verschachtelte CMT-Routen wieder bauen.

Wichtig:

- Ziel ist Build wieder gruen bekommen.
- Es werden keine Secrets verwendet.
- Es werden keine externen Calls gemacht.
- Die Stubs sind bewusst generisch und koennen spaeter durch echte Implementierungen ersetzt werden.

Ausfuehren:

```powershell
node .\fix-missing-lib-stubs\scripts\fix-missing-lib-stubs.cjs
npm run fixlibs:verify
npm run build
```

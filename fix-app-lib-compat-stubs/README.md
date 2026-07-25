# fix-app-lib-compat-stubs

Fix fuer aktuelle Build-Fehler, bei denen alte relative Imports versehentlich nach `frontend/app/lib/...` aufloesen.

Beispiel:

```text
../../../../lib/cmt-master-app-entry
```

landet aus einigen API-Routen nicht bei `frontend/lib`, sondern bei:

```text
frontend/app/lib
```

Dieser Patch erstellt Kompatibilitaets-Stubs in beiden Orten:

```text
frontend/app/lib/*.ts
frontend/lib/*.ts
```

Damit die Legacy-Routen wieder bauen.

Ausfuehren:

```powershell
node .\fix-app-lib-compat-stubs\scripts\fix-app-lib-compat-stubs.cjs
npm run fixapplib:verify
npm run build
```

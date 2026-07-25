# hotfix-api-import-depth

Fix fuer Next.js Module-not-found Fehler in API-Routen.

Problem:

Einige API-Routen unter

```text
frontend/app/api/cmt/master/secure/**/route.ts
```

importieren aus `frontend/lib/...` mit zu wenigen `../` Segmenten.

Beispiel Fehler:

```text
Module not found: Can't resolve '../../../../../../lib/cmt-secure-master-live-test-gate'
```

Fix:

Alle relativen Imports aus diesen API-Routen werden auf die korrekte Tiefe gesetzt:

```text
../../../../../../../lib/...
```

Ausfuehren:

```powershell
node .\hotfix-api-import-depth\scripts\hotfix-api-import-depth.cjs
npm run hotfixapi:verify
npm run build
```

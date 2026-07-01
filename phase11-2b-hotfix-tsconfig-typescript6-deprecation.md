# Phase 11.2b – Hotfix TypeScript 6 moduleResolution Deprecation

Der Root-Build lief bis zum Frontend erfolgreich, scheiterte danach aber am API-TypeScript-Check mit:

```text
TS5107: Option 'moduleResolution=node10' is deprecated and will stop functioning in TypeScript 7.0.
Specify compilerOption 'ignoreDeprecations': '6.0' to silence this error.
```

Dieser Hotfix ergänzt minimal-invasiv in `tsconfig.json`:

```json
"ignoreDeprecations": "6.0"
```

Ausführen:

```powershell
node scripts/phase11-2b-hotfix-tsconfig-typescript6-deprecation.cjs
npm run phase11:2b:verify
npm run build
```

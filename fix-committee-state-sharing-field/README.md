# fix-committee-state-sharing-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'externalSharingAllowed' does not exist on type committeeState
```

Die Committee-Status-Page liest noch ein weiteres Feld:

```ts
status.committeeState.externalSharingAllowed
```

Dieser Patch ergaenzt `externalSharingAllowed` mit sicherem Default `false` in:

```text
frontend/lib/cmt-master-committee-status.ts
frontend/app/lib/cmt-master-committee-status.ts
```

Ausfuehren:

```powershell
node .\fix-committee-state-sharing-field\scripts\fix-committee-state-sharing-field.cjs
npm run fixcommitteesharing:verify
npm run build
```

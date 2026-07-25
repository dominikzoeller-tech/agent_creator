# fix-committee-state-fields

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'integratedInSecureMaster' does not exist on type committeeState
```

Die Status-Page erwartet weitere Felder unter:

```ts
status.committeeState
```

Dieser Patch ergaenzt robuste UI-Felder in:

```text
frontend/lib/cmt-master-committee-status.ts
frontend/app/lib/cmt-master-committee-status.ts
```

Ausfuehren:

```powershell
node .\fix-committee-state-fields\scripts\fix-committee-state-fields.cjs
npm run fixcommitteestate:verify
npm run build
```

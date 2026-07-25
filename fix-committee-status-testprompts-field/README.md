# fix-committee-status-testprompts-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'testPrompts' does not exist on type 'SecureMasterCommitteeStatus'
```

Die Committee-Status-Page liest:

```ts
status.testPrompts
```

Dieser Patch ergaenzt `testPrompts: string[]` im Status-Return und im Typ in:

```text
frontend/lib/cmt-master-committee-status.ts
frontend/app/lib/cmt-master-committee-status.ts
```

Ausfuehren:

```powershell
node .\fix-committee-status-testprompts-field\scripts\fix-committee-status-testprompts-field.cjs
npm run fixcommitteetestprompts:verify
npm run build
```

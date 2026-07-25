# fix-committee-status-roles-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'roles' does not exist on type 'SecureMasterCommitteeStatus'
```

Die Committee-Status-Page liest:

```ts
status.roles
```

Dieser Patch ergaenzt `roles: string[]` im Status-Return und im Typ in:

```text
frontend/lib/cmt-master-committee-status.ts
frontend/app/lib/cmt-master-committee-status.ts
```

Ausfuehren:

```powershell
node .\fix-committee-status-roles-field\scripts\fix-committee-status-roles-field.cjs
npm run fixcommitteeroles:verify
npm run build
```

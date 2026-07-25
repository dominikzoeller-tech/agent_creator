# fix-committee-status-nextmilestones-field

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'nextMilestones' does not exist on type 'SecureMasterCommitteeStatus'
```

Die Committee-Status-Page liest:

```ts
status.nextMilestones
```

Dieser Patch ergaenzt `nextMilestones: string[]` im Status-Return und im Typ in:

```text
frontend/lib/cmt-master-committee-status.ts
frontend/app/lib/cmt-master-committee-status.ts
```

Ausfuehren:

```powershell
node .\fix-committee-status-nextmilestones-field\scripts\fix-committee-status-nextmilestones-field.cjs
npm run fixcommitteemilestones:verify
npm run build
```

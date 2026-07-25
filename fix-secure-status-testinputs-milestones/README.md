# fix-secure-status-testinputs-milestones

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'testInputs' does not exist on type 'SecureMasterStatus'
```

Die Secure-Status-Page liest:

```ts
status.testInputs
status.nextMilestones
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-master-secure-status.ts
frontend/app/lib/cmt-master-secure-status.ts
```

um:

```ts
testInputs: string[]
nextMilestones: string[]
```

Ausfuehren:

```powershell
node .\fix-secure-status-testinputs-milestones\scripts\fix-secure-status-testinputs-milestones.cjs
npm run fixsecurestatuslists:verify
npm run build
```

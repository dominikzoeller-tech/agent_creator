# fix-committee-result-type-export

Fix fuer aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'SecureMasterCommitteeResult'
```

Problem:

`frontend/app/lib/cmt-master-committee-status.ts` importiert:

```ts
import type { SecureMasterCommitteeResult } from './cmt-master-committee';
```

aber `frontend/app/lib/cmt-master-committee.ts` exportiert diesen Typ nicht mehr sauber.

Dieser Patch ergaenzt `SecureMasterCommitteeResult` in beiden Committee-Kompatibilitaetsmodulen:

```text
frontend/app/lib/cmt-master-committee.ts
frontend/lib/cmt-master-committee.ts
```

Ausfuehren:

```powershell
node .\fix-committee-result-type-export\scripts\fix-committee-result-type-export.cjs
npm run fixcommitteetype:verify
npm run build
```

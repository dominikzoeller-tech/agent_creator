# fix-privacy-gate-result-type

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Module './cmt-privacy-gate' has no exported member 'PrivacyGateResult'
```

Problem:

`frontend/lib/cmt-master-secure.ts` importiert:

```ts
import { evaluatePrivacyGate, type PrivacyGateResult } from './cmt-privacy-gate';
```

aber `frontend/lib/cmt-privacy-gate.ts` exportiert aktuell nur `CmtPrivacyDecision` bzw. `evaluateCmtPrivacyGate`.

Dieser Patch schreibt `cmt-privacy-gate.ts` robust neu und exportiert beide Kompatibilitaetsnamen:

```ts
PrivacyGateResult
CmtPrivacyDecision
evaluatePrivacyGate
evaluateCmtPrivacyGate
getPrivacyGateDemo
sanitizeForLocalPreview
```

Ausfuehren:

```powershell
node .\fix-privacy-gate-result-type\scripts\fix-privacy-gate-result-type.cjs
npm run fixprivacygateresult:verify
npm run build
```

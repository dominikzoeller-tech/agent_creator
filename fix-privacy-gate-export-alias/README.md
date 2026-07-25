# fix-privacy-gate-export-alias

Fix fuer aktuellen TypeScript-Buildfehler:

```text
has no exported member named 'evaluatePrivacyGate'
```

Die vorhandene Datei exportiert `evaluateCmtPrivacyGate`, aber alte Routen erwarten:

```ts
evaluatePrivacyGate
getPrivacyGateDemo
```

Dieser Patch ergaenzt diese Export-Aliase in:

```text
frontend/lib/cmt-privacy-gate.ts
frontend/app/lib/cmt-privacy-gate.ts
```

Ausfuehren:

```powershell
node .\fix-privacy-gate-export-alias\scripts\fix-privacy-gate-export-alias.cjs
npm run fixprivacyalias:verify
npm run build
```

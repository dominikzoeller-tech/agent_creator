# fix-privacy-gate-detected-flags

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'containsInternalSignals' does not exist on type 'PrivacyGateDetected'
```

Die Page `frontend/app/cmt/privacy/page.tsx` liest weitere Detection-Flags:

```ts
result.detected.containsInternalSignals
result.detected.containsPersonalSignals
result.detected.containsBusinessSignals
result.detected.containsSecretSignals
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-gate.ts
frontend/app/lib/cmt-privacy-gate.ts
```

um diese Flags und sichere Defaults.

Ausfuehren:

```powershell
node .\fix-privacy-gate-detected-flags\scripts\fix-privacy-gate-detected-flags.cjs
npm run fixprivacygateflags:verify
npm run build
```

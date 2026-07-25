# fix-privacy-decision-dispatch-flags

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'providerDispatchAllowed' does not exist on type 'PrivacyDecisionResult'
```

Die Page `frontend/app/cmt/privacy/decision/page.tsx` liest diese Safety-Flags:

```ts
result.providerDispatchAllowed
result.networkCallAllowed
result.finalDispatchBlocked
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-decision.ts
frontend/app/lib/cmt-privacy-decision.ts
```

um sichere Defaults:

```ts
providerDispatchAllowed: false
networkCallAllowed: false
finalDispatchBlocked: true
```

Ausfuehren:

```powershell
node .\fix-privacy-decision-dispatch-flags\scripts\fix-privacy-decision-dispatch-flags.cjs
npm run fixprivacydispatchflags:verify
npm run build
```

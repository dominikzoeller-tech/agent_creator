# fix-privacy-decision-safe-payload

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'safePayloadPreview' does not exist on type 'PrivacyDecisionResult'
```

Die Page `frontend/app/cmt/privacy/decision/page.tsx` liest:

```ts
result.safePayloadPreview
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-decision.ts
frontend/app/lib/cmt-privacy-decision.ts
```

um:

```ts
safePayloadPreview: string
```

und behaelt die bisherige kompatible Struktur bei:

```ts
result.outcome.accepted
result.gate.decision.decision
result.gate.detected.sensitivity
result.gate.approval.required
```

Ausfuehren:

```powershell
node .\fix-privacy-decision-safe-payload\scripts\fix-privacy-decision-safe-payload.cjs
npm run fixprivacysafepayload:verify
npm run build
```

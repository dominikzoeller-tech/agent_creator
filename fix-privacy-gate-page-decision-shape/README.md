# fix-privacy-gate-page-decision-shape

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'decision' does not exist on type 'PrivacyGateDecision'
```

Problemstelle:

```tsx
result.decision.decision
result.decision.reason
result.decision.recommendedAction
```

Die Page `frontend/app/cmt/privacy/page.tsx` erwartet, dass `result.decision` ein Objekt ist. Das Privacy-Gate-Modul lieferte/typisierte `decision` aber teilweise als String.

Dieser Patch stabilisiert:

```text
frontend/lib/cmt-privacy-gate.ts
frontend/app/lib/cmt-privacy-gate.ts
```

mit kompatibler Form:

```ts
result.decision.decision
result.decision.reason
result.decision.recommendedAction
result.detected.sensitivity
result.approval.required
```

Ausfuehren:

```powershell
node .\fix-privacy-gate-page-decision-shape\scripts\fix-privacy-gate-page-decision-shape.cjs
npm run fixprivacygatepageshape:verify
npm run build
```

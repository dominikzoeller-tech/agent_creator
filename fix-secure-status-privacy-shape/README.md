# fix-secure-status-privacy-shape

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'decision' does not exist on type 'PrivacyGateDecision'
```

Problemstelle:

```tsx
status.demo.privacy.decision.decision
```

Die Page erwartet diese Objektform:

```ts
privacy.decision.decision
```

aber `PrivacyGateResult.decision` war nur ein String:

```ts
'allow_local_only' | 'block_external'
```

Dieser Patch stabilisiert das Status-Modul und gibt `privacy.decision` als Objekt mit innerem `decision`-Feld zurueck.

Ausfuehren:

```powershell
node .\fix-secure-status-privacy-shape\scripts\fix-secure-status-privacy-shape.cjs
npm run fixsecurestatusprivacy:verify
npm run build
```

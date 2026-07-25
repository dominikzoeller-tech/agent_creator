# fix-privacy-gate-anonymized-preview

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Property 'anonymizedPreview' does not exist on type 'PrivacyGateResult'
```

Die Page `frontend/app/cmt/privacy/page.tsx` liest:

```ts
result.anonymizedPreview
```

Dieser Patch erweitert/stabilisiert:

```text
frontend/lib/cmt-privacy-gate.ts
frontend/app/lib/cmt-privacy-gate.ts
```

um:

```ts
anonymizedPreview: string
```

Der Wert nutzt dieselbe sichere Vorschau wie `safePayloadPreview`/`sanitizedText`.

Ausfuehren:

```powershell
node .\fix-privacy-gate-anonymized-preview\scripts\fix-privacy-gate-anonymized-preview.cjs
npm run fixprivacygatepreview:verify
npm run build
```

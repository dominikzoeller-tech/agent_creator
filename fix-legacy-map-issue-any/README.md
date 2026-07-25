# fix-legacy-map-issue-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'issue' implicitly has an 'any' type.
```

Der Patch typisiert weitere typische Legacy-`.map(...)` Callback-Parameter defensiv als `any`, z. B.:

```tsx
.map((issue) => ...)
```

wird zu:

```tsx
.map((issue: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-legacy-map-issue-any\scripts\fix-legacy-map-issue-any.cjs
npm run fixissueany:verify
npm run build
```

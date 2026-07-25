# fix-provider-map-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'provider' implicitly has an 'any' type.
```

Der Patch typisiert weitere Legacy-`.map(...)` Callback-Parameter defensiv als `any`, z. B.:

```tsx
.map((provider) => ...)
```

wird zu:

```tsx
.map((provider: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-provider-map-any\scripts\fix-provider-map-any.cjs
npm run fixproviderany:verify
npm run build
```

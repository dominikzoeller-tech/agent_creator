# fix-legacy-map-badge-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'badge' implicitly has an 'any' type.
```

Der Patch typisiert weitere typische Legacy-`.map(...)` Callback-Parameter defensiv als `any`, z. B.:

```tsx
.map((badge) => ...)
```

wird zu:

```tsx
.map((badge: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-legacy-map-badge-any\scripts\fix-legacy-map-badge-any.cjs
npm run fixbadgeany:verify
npm run build
```

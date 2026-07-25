# fix-legacy-map-role-any

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Parameter 'role' implicitly has an 'any' type.
```

Der Patch typisiert weitere typische Legacy-`.map(...)` Callback-Parameter defensiv als `any`, z. B.:

```tsx
.map((role) => ...)
```

wird zu:

```tsx
.map((role: any) => ...)
```

Ausfuehren:

```powershell
node .\fix-legacy-map-role-any\scripts\fix-legacy-map-role-any.cjs
npm run fixroleany:verify
npm run build
```

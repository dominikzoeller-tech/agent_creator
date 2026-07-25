# fix-object-entries-link-href

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Type 'unknown' is not assignable to type 'Url'
```

Problemstelle:

```tsx
Object.entries(status.routeMap).map(([key, value]) =>
  <Link href={value}>{key}: {value}</Link>
)
```

Bei `Object.entries(...)` ist `value` fuer TypeScript `unknown`. Next `Link href` braucht aber einen String/Url.

Dieser Patch ersetzt riskante `href={value}`-Stellen nach `Object.entries(...)` durch:

```tsx
href={String(value)}
```

und Textausgabe:

```tsx
{String(value)}
```

Ausfuehren:

```powershell
node .\fix-object-entries-link-href\scripts\fix-object-entries-link-href.cjs
npm run fixobjecthref:verify
npm run build
```

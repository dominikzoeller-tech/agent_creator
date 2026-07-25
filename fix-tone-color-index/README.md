# fix-tone-color-index

Fix fuer aktuellen TypeScript-Buildfehler:

```text
Element implicitly has an 'any' type because expression of type 'any' can't be used to index type toneColor
```

Problemstelle:

```tsx
toneColor[badge.tone]
```

`badge` ist defensiv als `any` typisiert. Dadurch ist `badge.tone` fuer TypeScript nicht sicher als Key von `toneColor` bekannt.

Fix:

```tsx
toneColor[badge.tone as keyof typeof toneColor]
```

Ausfuehren:

```powershell
node .\fix-tone-color-index\scripts\fix-tone-color-index.cjs
npm run fixtoneindex:verify
npm run build
```

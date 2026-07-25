# fix-broken-join-newlines

Fix fuer Build-Fehler:

```text
Unterminated string constant
].join('
');
```

Einige alte `page.tsx` Dateien enthalten kaputte String-Literale:

```ts
].join('
');
```

wurde kaputt als zwei Zeilen gespeichert:

```ts
].join('
');
```

Dieser Patch repariert alle Vorkommen in `frontend/app/**/*.tsx` auf:

```ts
].join('\n');
```

Ausfuehren:

```powershell
node .\fix-broken-join-newlines\scripts\fix-broken-join-newlines.cjs
npm run fixjoin:verify
npm run build
```

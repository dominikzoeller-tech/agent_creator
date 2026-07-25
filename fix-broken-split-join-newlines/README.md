# fix-broken-split-join-newlines

Fix fuer Build-Fehler:

```text
Unterminated string constant
const items = text.split('
');
```

Einige alte `page.tsx` Dateien enthalten kaputte String-Literale bei `.split()` und `.join()`.

Dieser Patch repariert alle kaputten Pattern in `frontend/app/**/*.ts(x)` auf:

```ts
.split('\n')
.join('\n')
```

Ausführen:

```powershell
node .\fix-broken-split-join-newlines\scripts\fix-broken-split-join-newlines.cjs
npm run fixsplitjoin:verify
npm run build
```

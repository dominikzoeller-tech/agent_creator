# live-test-2

Ziel: Kontrollierten Live-Test vorbereiten, aber weiterhin nur mit hartem serverseitigem ENV-Gate.

Wichtig:

- Kein Secret im Client.
- Kein API-Key im Repository.
- Echter Provider-Call nur, wenn alle ENV-Gates serverseitig auf `true` stehen und `PROVIDER_API_KEY` vorhanden ist.
- Dieser Patch erweitert den Live-Test um einen separaten Preflight-Endpunkt und eine klare UI-Auswertung.

Neue API Route:

```text
/api/cmt/master/secure/live-test/preflight
```

Bestehender Provider-Testpfad bleibt:

```text
/api/cmt/master/secure/live-test/provider
```

Ausfuehren:

```powershell
node .\live-test-2\scripts\live-test-2.cjs
npm run live2:verify
npm run build
```

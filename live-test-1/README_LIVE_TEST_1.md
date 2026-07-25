# live-test-1

Erster echter Live-Test-Pfad wird vorbereitet.

Wichtig:

- Dieser Patch baut den serverseitigen Live-Test-Codepfad.
- Der Provider-Call bleibt standardmaessig blockiert.
- Ein echter Call ist nur moeglich, wenn serverseitige ENV-Gates explizit gesetzt werden.
- Keine Secrets im Client.
- Keine internen/personenbezogenen Testdaten senden.

Neue API Route:

```text
/api/cmt/master/secure/live-test/provider
```

Der Route-Handler prueft hart:

- `LIVE_TEST_ENABLED=true`
- `PROVIDER_ENABLED=true`
- `LIVE_MODEL_ENABLED=true`
- `EXTERNAL_SHARING_ALLOWED=true`
- `PROVIDER_API_KEY` vorhanden
- `PROVIDER_MODEL` vorhanden
- Eingabe enthaelt keine blockierten sensiblen Begriffe

Ohne diese Gates bleibt der Provider-Call blockiert.

Ausfuehren:

```powershell
node .\live-test-1\scripts\live-test-1.cjs
npm run live1:verify
npm run build
```

# live-test-3

Ziel: Echten Live-Test kontrolliert vorbereiten mit lokaler ENV-Checkliste, aber weiterhin ohne automatische Aktivierung.

Wichtig:

- Kein Secret im Client.
- Kein API-Key im Repository.
- Dieser Patch schreibt keine `.env.local` mit echten Werten.
- Der Live-Provider-Call bleibt blockiert, solange die serverseitigen ENV-Gates nicht bewusst gesetzt werden.

Enthaelt:

1. `.env.live-test.example` mit sicheren Platzhaltern
2. Live-Test-Runbook als Markdown
3. API Route `/api/cmt/master/secure/live-test/runbook`
4. UI-Block `Live-Test-Runbook`
5. Button `Live-Test-Runbook laden`
6. klare Schrittfolge fuer den ersten echten Provider-Test
7. weiterhin keine Secrets im Client
8. weiterhin kein automatischer Provider-Call

Ausfuehren:

```powershell
node .\live-test-3\scripts\live-test-3.cjs
npm run live3:verify
npm run build
```

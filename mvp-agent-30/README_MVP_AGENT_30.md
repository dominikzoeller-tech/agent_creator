# mvp-agent-30

Grosser Sprint-Patch 3/5 bis Live-Test: Secret/Git-Preflight technisch pruefen.

Ziel: Der Secure Master Agent bekommt einen serverseitigen Preflight-Check, der ohne echte Secrets prueft, ob `.env.example` vorhanden ist und ob `.gitignore` typische Secret-Dateien ausschliesst.

Enthaelt:

1. Secret/Git-Preflight-Check-Modul
2. API Route `/api/cmt/master/secure/secret/preflight`
3. Route liest keine echten Secrets aus
4. Route gibt nur sichere Ja/Nein-Checks zurueck
5. sichtbarer Secret/Git-Preflight-Check auf `/cmt/master/secure/agent`
6. Button: `Secret-Preflight pruefen`
7. Export enthaelt `secretPreflightResult`
8. kein echter Provider-Call
9. keine echten Secrets
10. keine neuen Status-/Entry-/Handoff-Seiten

Live-Test Countdown:

- mvp-agent-28: Audit-Verlauf erledigt
- mvp-agent-29: serverseitiger Provider-Adapter deaktiviert erledigt
- mvp-agent-30: Secret/Git-Preflight technisch pruefen
- mvp-agent-31: Budget/Token-Limit
- mvp-agent-32: manueller Live-Test-Schalter

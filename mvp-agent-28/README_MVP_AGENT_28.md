# mvp-agent-28

Grosser Sprint-Patch 1/5 bis Live-Test: lokaler Audit-Verlauf.

Ziel: Provider-Audit-Envelope wird nicht nur erzeugt, sondern lokal im Browser als Audit-Verlauf gespeichert und exportiert.

Enthaelt:

1. Audit-History-Modul
2. Audit-Envelope wird lokal gespeichert
3. sichtbarer Audit-Verlauf auf `/cmt/master/secure/agent`
4. Button zum Loeschen des Audit-Verlaufs
5. Export enthaelt `providerAuditHistory`
6. Live bleibt blockiert
7. kein echter Provider-Call
8. keine echten Secrets
9. keine neuen Status-/Entry-/Handoff-Seiten

Live-Test Countdown:

- mvp-agent-28: Audit-Verlauf
- mvp-agent-29: serverseitiger Provider-Adapter deaktiviert
- mvp-agent-30: Secret/Git-Preflight technisch pruefen
- mvp-agent-31: Budget/Token-Limit
- mvp-agent-32: manueller Live-Test-Schalter

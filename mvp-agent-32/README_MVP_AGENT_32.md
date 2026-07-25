# mvp-agent-32

Grosser Sprint-Patch 5/5 bis Live-Test: manueller Live-Test-Schalter vorbereitet.

Wichtig: Dieser Patch aktiviert noch keinen echten Provider-Call.

Ziel: Der Secure Master Agent zeigt den manuellen Live-Test-Schalter und alle notwendigen Gates, bleibt aber standardmaessig blockiert.

Enthaelt:

1. Live-Test-Gate-Modul
2. API Route `/api/cmt/master/secure/live-test/gate`
3. Gate prueft Voraussetzungen, gibt aber `canStartLiveTest = false` zurueck
4. sichtbarer Live-Test-Gate-Block auf `/cmt/master/secure/agent`
5. Button: `Live-Test-Gate pruefen`
6. Export enthaelt `liveTestGateResult`
7. kein echter Provider-Call
8. keine echten Secrets
9. keine neuen Status-/Entry-/Handoff-Seiten

Live-Test Countdown:

- mvp-agent-28: Audit-Verlauf erledigt
- mvp-agent-29: serverseitiger Provider-Adapter deaktiviert erledigt
- mvp-agent-30: Secret/Git-Preflight technisch erledigt
- mvp-agent-31: Budget/Token-Limit erledigt
- mvp-agent-32: manueller Live-Test-Schalter vorbereitet

Nach diesem Patch kann der erste echte Live-Test vorbereitet werden. Dafuer braucht es danach bewusst einen separaten Freigabe-Patch mit echten lokalen ENV-Werten serverseitig und weiterhin ohne Secrets im Client.

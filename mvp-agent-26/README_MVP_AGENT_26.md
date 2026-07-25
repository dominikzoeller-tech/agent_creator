# mvp-agent-26

Grosser Sprint-Patch: serverseitigen Provider-Dry-Run-Endpunkt vorbereiten, weiterhin ohne echte Secrets und ohne echten Provider-Call.

Ziel: Der Secure Master Agent bekommt einen serverseitigen API-Route-Stub fuer spaetere Provider-Aufrufe. Der Endpunkt ist sicher blockiert und liefert nur einen lokalen Dry-Run-Envelope.

Enthaelt:

1. Server Provider Dry-Run Contract Modul
2. API Route `/api/cmt/master/secure/provider/dry-run`
3. Route blockiert echten Provider-Call immer
4. sichtbarer Server-Dry-Run-Block auf `/cmt/master/secure/agent`
5. Client kann den blockierten Endpunkt spaeter testen
6. Export enthaelt `serverDryRunPrepared`
7. kein echter Provider-Call
8. keine echten Secrets
9. keine neuen Status-/Entry-/Handoff-Seiten

Weiterhin sicher:

- providerEnabled = false
- providerCallAllowed = false
- liveModelEnabled = false
- externalSharingAllowed = false
- realSecretsAllowedNow = false

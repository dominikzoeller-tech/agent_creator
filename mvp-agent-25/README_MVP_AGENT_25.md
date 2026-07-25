# mvp-agent-25

Groesserer Sprint-Patch: `.env.example` + serverseitiger Provider-Config-Stub.

Ziel: Echte Provider-Konfiguration wird strukturell vorbereitet, aber weiterhin ohne echte Secrets und ohne Provider-Call.

Enthaelt:

1. `.env.example` mit Platzhaltern ohne echte Secrets
2. serverseitiges Provider-Config-Modul
3. Secret-Werte werden nicht im Client angezeigt
4. Provider bleibt deaktiviert
5. sichtbarer Provider-Config-Stub-Block auf `/cmt/master/secure/agent`
6. Export enthaelt `serverProviderConfigPreview`
7. kein echter Provider-Call
8. keine neuen Status-/Entry-/Handoff-Seiten

Weiterhin sicher:

- providerEnabled = false
- providerCallAllowed = false
- liveModelEnabled = false
- externalSharingAllowed = false
- realSecretsAllowedNow = false

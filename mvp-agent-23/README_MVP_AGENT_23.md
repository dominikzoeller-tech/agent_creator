# mvp-agent-23

Groesserer Sprint-Patch: Secret-/API-Key-Verwaltung als blockierten sicheren Entwurf vorbereiten.

Ziel: Der Secure Master Agent zeigt, welche Secret-Verwaltung fuer echte Provider-Nutzung spaeter notwendig ist, ohne API-Keys einzugeben, zu speichern oder zu verwenden.

Enthaelt:

1. Secret-Readiness-Modul
2. sichtbarer Secret-/API-Key-Sicherheitsblock auf `/cmt/master/secure/agent`
3. klare Anzeige: Browser-Speicherung fuer Secrets verboten
4. klare Anzeige: Repo-Speicherung fuer Secrets verboten
5. benoetigte sichere Speicherorte spaeter sichtbar
6. Export enthaelt `secretReadiness`
7. kein echter Provider-Call
8. keine neuen Status-/Entry-/Handoff-Seiten

Hauptseite bleibt:

```text
/cmt/master/secure/agent
```

Weiterhin sicher:

- secretInputAllowed = false
- browserSecretStorageAllowed = false
- repoSecretStorageAllowed = false
- providerCallAllowed = false
- liveModelEnabled = false

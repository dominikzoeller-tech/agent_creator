# mvp-agent-14

Groesserer Sprint-Patch: Dry-Run-Qualitaet + Agentenentscheidung verbessern.

Ziel: Die zentrale Secure-Master-Agent-Seite bekommt bessere Entscheidungsanzeige und eine klare Empfehlung, ob die Antwort lokal reicht, das Gremium gebraucht wird oder ein Provider-Dry-Run sinnvoll ist.

Enthaelt:

1. Agent Decision Summary Modul
2. sichtbare Entscheidungszusammenfassung auf der Hauptseite
3. Recommendation-Badge: local_answer / committee / provider_dry_run / blocked
4. naechste beste Aktion wird aus Intent, Route, Privacy und Approval abgeleitet
5. Dry-Run bleibt simuliert und blockiert echte Provider-Calls
6. Export bleibt erweitert
7. keine neuen Status-/Entry-/Handoff-Seiten

Hauptseite bleibt:

```text
/cmt/master/secure/agent
```

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
- providerCallAllowed = false
- dryRunOnly = true

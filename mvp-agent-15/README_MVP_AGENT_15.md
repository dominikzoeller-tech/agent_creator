# mvp-agent-15

Groesserer Sprint-Patch: lokaler Aktionsplan + bessere Arbeitsentscheidung.

Ziel: Der Secure Master Agent zeigt nach einer Frage nicht nur Antwort und Entscheidung, sondern auch einen konkreten lokalen Aktionsplan.

Enthaelt:

1. Action-Plan-Modul
2. Aktionsplan auf der Agent-Hauptseite
3. konkrete To-dos aus Intent/Route/Privacy/Approval
4. klare Live-Grenze bleibt bestehen
5. Provider-Dry-Run bleibt simuliert
6. keine neuen Status-/Entry-/Handoff-Seiten

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

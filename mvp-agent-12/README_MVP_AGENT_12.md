# mvp-agent-12

Großer Sprint-Patch: Provider-Dry-Run vorbereiten.

Ziel: Der Secure Master Agent bekommt einen simulierten Provider-Dry-Run, ohne echten Provider-Aufruf.

Enthält:

1. Provider-Dry-Run-Adapter lokal
2. simulierte Modellantwort ohne API-Key
3. klare Trennung zwischen `local_answer` und `provider_dry_run`
4. sichtbarer Provider-Dry-Run-Block auf der Hauptseite
5. Export enthält weiterhin lokale Freigabe + Live-Gate-Snapshot
6. kein echter Provider-Call
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

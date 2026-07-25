# mvp-agent-21

Groesserer Sprint-Patch: Provider-Adapter-Contract als deaktivierten Codepfad verdichten.

Ziel: Der Secure Master Agent bekommt eine klarere Provider-Adapter-Pipeline, aber weiterhin ohne echten Provider-Call.

Enthaelt:

1. Provider Adapter Pipeline Modul
2. Pipeline-Stufen: prepare -> validate -> approve -> dispatch_blocked
3. sichtbarer Pipeline-Block auf `/cmt/master/secure/agent`
4. Pipeline-Snapshot im Export
5. klare Aussage: Live-Dispatch bleibt blockiert
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
- adapterDispatchAllowed = false
- providerCallAllowed = false
- dryRunOnly = true

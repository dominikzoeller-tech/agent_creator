# mvp-agent-8

Ziel: Provider-Setup-Validierung vorbereiten, aber weiterhin ohne Speichern und ohne Provider-Call.

Keine neuen Status-/Entry-/Handoff-Seiten.

Verbesserungen auf `/cmt/master/secure/agent`:

- lokale Validierungsregeln sichtbar
- Checkliste vor Live-KI sichtbar
- zeigt klar: API-Key darf noch nicht gespeichert werden
- zeigt klar: Provider-Call bleibt blockiert
- bereitet späteren Freigabe-/Validierungsfluss vor

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
- noSecretPersistence = true
- noProviderCall = true

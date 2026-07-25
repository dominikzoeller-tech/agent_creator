# mvp-agent-9

Ziel: Lokalen Freigabeentscheid vorbereiten.

Keine neuen Status-/Entry-/Handoff-Seiten.

Verbesserungen auf `/cmt/master/secure/agent`:

- lokaler Freigabeentscheid sichtbar
- Optionen: `local_only`, `anonymize_then_send`, `cancel`
- externe Sendung bleibt weiterhin blockiert
- klare Erklärung, wann welche Option später sinnvoll ist
- Provider bleibt deaktiviert

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
- noProviderCall = true

# mvp-agent-7

Ziel: Provider-Setup-Form sichtbar vorbereiten, aber weiterhin ohne Speicherung und ohne Provider-Call.

Keine neuen Status-/Entry-/Handoff-Seiten.

Verbesserungen auf `/cmt/master/secure/agent`:

- Provider-Setup-Form UI sichtbar
- Provider/Model/API-Key Platzhalter sichtbar
- Save/Activate bleibt blockiert
- klare Warnung: keine Werte eingeben, kein echter Key speichern
- nächster Schritt Richtung kontrolliertes Provider-Gate

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
- noSecretPersistence = true
- noProviderCall = true
